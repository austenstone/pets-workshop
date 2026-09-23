# Creating Custom Actions

| [← Deploy to Azure][walkthrough-previous] | [Next: Reusable Workflows →][walkthrough-next] |
|:-----------------------------------|------------------------------------------:|

Custom actions let you encapsulate reusable logic into a single step you can use across workflows. GitHub Actions supports three types of custom actions: **[composite][creating-composite-action]** (combines multiple steps), **[JavaScript][creating-javascript-action]** (runs Node.js code), and **[Docker container][creating-docker-container-action]** (runs in a container). Composite actions are the most approachable and a great starting point for bundling common step patterns.

In this exercise you'll create a composite action that sets up the Python environment and seeds the test database, then use it in your CI workflow.

## Scenario

The pet shelter's test workflows need to seed the database before running tests. This involves setting up Python, installing dependencies, and running `seed_database.py`. Rather than duplicating these steps in every workflow, we'll create a custom composite action that any workflow can reference in a single step.

## Background

The great advantage to a composite action is it builds upon the knowledge you already have. You've defined actions already, and a custom action uses a very similar syntax, all defined in YAML.

Every custom action is defined by an `action.yml` file. This file describes the action's interface and behavior:

- **`name`**: A human-readable name for the action.
- **`description`**: A short summary of what the action does.
- **`inputs`**: Parameters the caller can pass to the action.
- **`outputs`**: Values the action makes available to subsequent steps.
- **`runs`**: Defines how the action executes. Composite actions use `runs.using: 'composite'` with a list of `steps`.

Inputs and outputs let the action communicate with the calling workflow, making the action flexible and reusable across different contexts.

## Create the setup-python-env action

Let's create a composite action that sets up Python, installs dependencies, and seeds the test database.

1. In your workspace's Explorer, create `.github/actions/setup-python-env/action.yml` directly. VS Code, Codespaces, github.dev, and GitHub's web file editor accept the nested path and create its parent folders.
2. If you prefer a terminal, you can create the directory first:

    ```bash
    mkdir -p .github/actions/setup-python-env
    ```

3. Add the following YAML to `action.yml` to define your composite action:

    ```yaml
    name: 'Setup Python Environment'
    description: 'Sets up Python, installs dependencies, and seeds the test database'

    inputs:
      python-version:
        description: 'Python version to use'
        required: false
        default: '3.14'
      database-path:
        description: 'Path to the test database file'
        required: false
        default: 'app/server/test_dogshelter.db'

    outputs:
      database-file:
        description: 'Path to the seeded database file'
        value: ${{ steps.database.outputs.path }}

    runs:
      using: 'composite'
      steps:
        - name: Set up Python
          uses: actions/setup-python@v7
          with:
            python-version: ${{ inputs.python-version }}
            cache: 'pip'

        - name: Install dependencies
          run: pip install -r app/server/requirements.txt
          shell: bash

        - name: Resolve database path
          id: database
          env:
            INPUT_DATABASE_PATH: ${{ inputs.database-path }}
          run: |
            database_path="$INPUT_DATABASE_PATH"
            if [[ "$database_path" != /* ]]; then
              database_path="$GITHUB_WORKSPACE/${database_path#./}"
            fi
            echo "path=$database_path" >> "$GITHUB_OUTPUT"
          shell: bash

        - name: Seed the database
          run: python app/server/utils/seed_database.py
          shell: bash
          env:
            DATABASE_PATH: ${{ steps.database.outputs.path }}
    ```

> [!NOTE]
> Composite action steps must include `shell: bash` for every `run` step — this is required even though it seems redundant. Without it, the workflow will fail with a validation error.

Review the key parts of the action:
- **Inputs** provide sensible defaults so callers only need to override what's different.
- **The Python setup step** preserves the pip cache from the previous exercise.
- **The path-resolution step** converts a repository-relative input to an absolute path. This matters because the seed command runs from the repository root while the Python tests run from `app/server`.
- **Outputs** expose that absolute path to the calling workflow so every process opens the same SQLite file.
- Each `run` step explicitly declares `shell: bash` as required by composite actions.

## Use the action in the CI workflow

Now let's update the CI workflow to use the custom action instead of the individual setup and install steps.

1. Open `.github/workflows/run-tests.yml`. In the `test-api` job, replace the **Set up Python** and **Install dependencies** steps (lines 23–32) with a single call to the composite action:

    ```yaml
          - name: Setup Python environment
            id: seed
            uses: ./.github/actions/setup-python-env
            with:
              python-version: ${{ matrix.python-version }}
              database-path: app/server/test_dogshelter.db
    ```

2. Update the **Run tests** step in `test-api` (line 34) to pass the absolute database path from the action's output:

    ```yaml
          - name: Run tests
            run: python -m unittest test_app -v
            working-directory: ./app/server
            env:
              DATABASE_PATH: ${{ steps.seed.outputs.database-file }}
    ```

3. The `test-e2e` job has the same **Set up Python** and **Install Python dependencies** steps — a perfect chance to reuse the action. Replace those two steps with the same composite action call (no `python-version` override needed since the action defaults to 3.14):

    ```yaml
          - name: Setup Python environment
            id: seed
            uses: ./.github/actions/setup-python-env
            with:
              database-path: app/server/test_dogshelter.db
    ```

    Then update the **Run e2e tests** step to pass the database path so the Flask server started by Playwright can find the seeded database:

    ```yaml
          - name: Run e2e tests
            working-directory: ./app/client
            run: npx playwright test
            env:
              DATABASE_PATH: ${{ steps.seed.outputs.database-file }}
    ```

4. Here's the complete updated `run-tests.yml` for reference:

    ```yaml
    name: Run Tests

    on:
      push:
        branches: [main]
      pull_request:
        branches: [main]

    permissions:
      contents: read

    jobs:
      test-api:
        runs-on: ubuntu-latest
        strategy:
          fail-fast: false
          matrix:
            python-version: ['3.12', '3.13', '3.14']

        steps:
          - uses: actions/checkout@v7

          - name: Setup Python environment
            id: seed
            uses: ./.github/actions/setup-python-env
            with:
              python-version: ${{ matrix.python-version }}
              database-path: app/server/test_dogshelter.db

          - name: Run tests
            run: python -m unittest test_app -v
            working-directory: ./app/server
            env:
              DATABASE_PATH: ${{ steps.seed.outputs.database-file }}

      test-e2e:
        runs-on: ubuntu-latest

        steps:
          - uses: actions/checkout@v7

          - name: Setup Python environment
            id: seed
            uses: ./.github/actions/setup-python-env
            with:
              database-path: app/server/test_dogshelter.db

          - name: Set up Node.js
            uses: actions/setup-node@v7
            with:
              node-version: '24'
              cache: 'npm'
              cache-dependency-path: 'app/client/package-lock.json'

          - name: Install Node dependencies
            working-directory: ./app/client
            run: npm ci

          - name: Install Playwright browsers
            working-directory: ./app/client
            run: npx playwright install --with-deps chromium

          - name: Run e2e tests
            working-directory: ./app/client
            run: npx playwright test
            env:
              DATABASE_PATH: ${{ steps.seed.outputs.database-file }}
    ```

5. Use your editor's **Source Control** view to stage both files, enter `Add setup-python-env composite action`, commit, and push or sync. If you have a terminal, the equivalent commands are:

    ```bash
    git add .github/actions/setup-python-env/action.yml .github/workflows/run-tests.yml
    git commit -m "Add setup-python-env composite action"
    git push
    ```

6. Navigate to the **Actions** tab on GitHub and verify the workflow runs successfully with the new action.

> [!TIP]
> When developing custom actions, you can test them by pushing to a branch and triggering a workflow run. Check the workflow logs to ensure each step in your composite action executes as expected.

## Types of custom actions

GitHub Actions supports three types of custom actions, each suited to different use cases:

| Type | Best for | Runs on | Complexity |
|------|----------|---------|------------|
| **Composite** | Bundling multiple existing steps into one | Directly on the runner | Easiest to create |
| **JavaScript** | Complex logic, API calls, or custom computations | Node.js runtime | Moderate |
| **Docker container** | Actions that need specific tools or environments | Inside a container | Most involved |

- **Composite actions** are ideal when you want to combine several existing steps (like we did with setup, install, and seed) into a single reusable unit. They're the fastest to create because they use the same step syntax you already know.
- **JavaScript actions** are best when you need custom logic, such as making API calls, processing data, or interacting with the GitHub API. They run on Node.js and have access to the `@actions/core` and `@actions/github` packages.
- **Docker container actions** are best when your action requires specific tools, operating system libraries, or a particular runtime environment. They run in a Docker container, giving you full control over the execution environment.

## Summary and next steps

Custom actions reduce duplication and make workflows cleaner. You've created a composite action that encapsulates Python setup and database seeding into a single reusable step. Any workflow in the repository can now prepare the Python environment with a single `uses` reference.

Next, we'll take reusability to the next level by exploring [reusable workflows][walkthrough-next] for sharing entire workflow patterns across your CI/CD pipeline.

## Resources

- [Creating a composite action][creating-composite-action]
- [About custom actions][about-custom-actions]
- [Metadata syntax for GitHub Actions][metadata-syntax]
- [GitHub Skills: Reusable workflows][skills-reusable-workflows]

| [← Deploy to Azure][walkthrough-previous] | [Next: Reusable Workflows →][walkthrough-next] |
|:-----------------------------------|------------------------------------------:|

[about-custom-actions]: https://docs.github.com/actions/sharing-automations/creating-actions/about-custom-actions
[creating-composite-action]: https://docs.github.com/actions/sharing-automations/creating-actions/creating-a-composite-action
[creating-docker-container-action]: https://docs.github.com/actions/sharing-automations/creating-actions/creating-a-docker-container-action
[creating-javascript-action]: https://docs.github.com/actions/sharing-automations/creating-actions/creating-a-javascript-action
[deploy-azure]: 06-deploy-azure.md
[metadata-syntax]: https://docs.github.com/actions/sharing-automations/creating-actions/metadata-syntax-for-github-actions
[skills-reusable-workflows]: https://github.com/skills/reusable-workflows
[walkthrough-previous]: 06-deploy-azure.md
[walkthrough-next]: 08-reusable-workflows.md
