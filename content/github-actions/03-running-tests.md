# Running Tests

| [← Securing the Development Pipeline][walkthrough-previous] | [Next: Caching →][walkthrough-next] |
|:-----------------------------------|------------------------------------------:|

Now that you know the basics of GitHub Actions and have seen how GitHub uses it for code scanning, it's time to build your own workflow. In this exercise you'll create a **continuous integration (CI)** pipeline that automatically runs the shelter's tests.

## Scenario

The shelter's app is growing, and the team wants to make sure new changes don't break existing functionality. The application has two test suites: **unit tests** for the Flask API, and **end-to-end (e2e) tests** that use [Playwright][playwright] to test the full stack in a browser. The goal is to run both automatically on every push and pull request (PR) to `main`.

## Background

As you saw in the [introduction][introduction], the `on` declaration specifies when a workflow will run. For true automation, you'll use `on` to indicate the [triggers][workflow-triggers] for the workflow to run automatically. In our scenario, this will be whenever a PR is made to the `main` branch, or when code is pushed or merged into it.

Most workflows have a relatively common set of tasks. You typically need to install libraries, perform builds, and run various commands. Rather than having to script everything out by hand, there's a collection of available actions in a marketplace - the aptly named [Actions Marketplace][actions-marketplace]. There you can find pluggable, reusable actions, ready to be added to any workflow.

## Using the Actions Marketplace

The [Actions Marketplace][actions-marketplace] contains tens of thousands of community created actions. These include those from OSS contributors of all sizes, and vendors to allow for quick integration of their products.

For most actions, you can just add the name of the action, typically `vendor/action-name`, the necessary configuration, and it's now part of your workflow!

### Security and the Actions Marketplace

The marketplace offers various protections to ensure you're using the right action at the right time. For starters, creators can be [verified][marketplace-badges] by GitHub, giving you the confidence the organization who says they built an action is the one who actually built it.

In addition, you can [pin to a specific version, SHA or branch][action-versioning]. This both increases security, knowing the code you expect to run is what runs, and consistency as it'll always be the same code over and over.

## Create the CI workflow

Our application has a Flask backend with unit tests, and an Astro frontend that's validated with end-to-end tests. Let's begin building a workflow to run these tests. We'll start with the unit tests, then add the end-to-end tests a bit later in this lesson.

To run the unit tests, you'll need to do the following in the workflow:

- checkout the code.
- install Python.
- install the necessary Python libraries.
- run the tests.

Let's build that out!

1. In your workspace, create a new file named `.github/workflows/run-tests.yml`.
2. Add the following content:

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

        steps:
          - uses: actions/checkout@v7

          - name: Set up Python
            uses: actions/setup-python@v7
            with:
              python-version: '3.14'

          - name: Install dependencies
            run: |
              python -m pip install --upgrade pip
              pip install -r app/server/requirements.txt

          - name: Run tests
            working-directory: ./app/server
            run: |
              python -m unittest test_app -v
    ```

3. Save the file.

Notice how this workflow differs from the hello world:
- It triggers on `push` and `pull_request` events instead of `workflow_dispatch` — so it runs automatically when a PR or merge is made to the specified branch(es).
- It declares explicit **`permissions`** — we'll explain this next.
- It uses `actions/checkout@v7` to clone your repository code onto the runner, using the `checkout` action from the marketplace.
- It uses `actions/setup-python@v7` to install a specific Python version, yet another action from the marketplace.
- Next, it installs the necessary libraries using `pip`, just like you normally would.
- Finally, it's time to run the tests - again, just like before!

## Understanding `GITHUB_TOKEN` and permissions

Every workflow run automatically receives a token called **`GITHUB_TOKEN`**. This is a short-lived credential that actions use behind the scenes to interact with your repository — for example, `actions/checkout` uses it to clone your code. The token is created when the workflow starts and revoked when the run ends.

The **`permissions`** block controls what this token can do. For our CI workflow, we only need `contents: read` — enough to clone the repository. This follows the [principle of least privilege][principle-least-privilege]: grant only the permissions your workflow actually needs, nothing more.

> [!IMPORTANT]
> Always set explicit `permissions` in your workflows. Without it, the token inherits the repository-level defaults (**Settings** > **Actions** > **General** > **Workflow permissions**), which may be more permissive than your workflow requires. Being explicit ensures your workflow only has the access it needs — even if someone changes the repository defaults later.

## Push and explore

A bit later you'll use a more standard branching approach for changes. But for our purposes right now, let's push straight to `main`. What you'll notice is the workflow will automatically run, since the workflow will now exist on `main`!

1. Use your editor's **Source Control** view to stage `run-tests.yml`, enter `Add CI workflow with unit tests`, commit, and push or sync. If you have a terminal, the equivalent commands are:

    ```bash
    git add .github/workflows/run-tests.yml
    git commit -m "Add CI workflow with unit tests"
    git push
    ```

2. Navigate to the **Actions** tab — the **Run Tests** workflow should already be running (triggered by the push).
3. Select the **test-api** job and explore the logs. Notice the flow of checkout, Python setup, and dependency installation.

## Add e2e tests in parallel

The unit tests cover the API, but the shelter also has Playwright e2e tests that verify the full application works end-to-end in a real browser. Let's add a second job that runs alongside the unit tests.

1. Return to your workspace and open `.github/workflows/run-tests.yml`. Add the following job to the bottom of the file:

    ```yaml
      test-e2e:
        runs-on: ubuntu-latest

        steps:
          - uses: actions/checkout@v7

          - name: Set up Python
            uses: actions/setup-python@v7
            with:
              python-version: '3.14'

          - name: Install Python dependencies
            run: |
              python -m pip install --upgrade pip
              pip install -r app/server/requirements.txt

          - name: Set up Node.js
            uses: actions/setup-node@v7
            with:
              node-version: '24'

          - name: Install Node dependencies
            working-directory: ./app/client
            run: npm ci

          - name: Install Playwright browsers
            working-directory: ./app/client
            run: npx playwright install --with-deps chromium

          - name: Run e2e tests
            working-directory: ./app/client
            run: npx playwright test
    ```

2. Save the file.

> [!NOTE]
> Because we haven't added a `needs` key, `test-api` and `test-e2e` will run **in parallel**. Each job gets its own runner, so they don't interfere with each other and the total CI time is closer to the duration of the slower job rather than the sum of both. The `test-e2e` job needs both Python and Node.js because the Playwright tests launch the full stack — the Flask API and the Astro frontend — before running browser tests against them.

1. Use your editor's **Source Control** view to commit and push the updated workflow, or use these optional terminal commands:

    ```bash
    git add .github/workflows/run-tests.yml
    git commit -m "Add e2e tests running in parallel"
    git push
    ```

2. Navigate to the **Actions** tab and select the new workflow run. You should see both **test-api** and **test-e2e** running side by side.

## Summary and next steps

You've built a CI pipeline with two jobs running in parallel — unit tests for the API and end-to-end tests for the full application. This is the foundation of continuous integration — catching problems early so they don't reach production.

Now, let's work to [improve the performance of our CI job][walkthrough-next] by reusing steps and caching dependencies.

## Resources

- [GitHub Actions documentation][github-actions-docs]
- [Workflow syntax for GitHub Actions][workflow-syntax]
- [Events that trigger workflows][workflow-triggers]
- [Using jobs in a workflow][jobs-docs]
- [Automatic token authentication][automatic-token-auth]
- [Assigning permissions to jobs][permissions-docs]

| [← Securing the Development Pipeline][walkthrough-previous] | [Next: Caching →][walkthrough-next] |
|:-----------------------------------|------------------------------------------:|

[action-versioning]: https://docs.github.com/actions/how-tos/write-workflows/choose-what-workflows-do/find-and-customize-actions#using-release-management-for-your-custom-actions
[actions-marketplace]: https://github.com/marketplace?type=actions
[automatic-token-auth]: https://docs.github.com/actions/security-for-github-actions/security-guides/automatic-token-authentication
[github-actions-docs]: https://docs.github.com/actions
[introduction]: 01-introduction.md
[jobs-docs]: https://docs.github.com/actions/writing-workflows/choosing-what-your-workflow-does/using-jobs-in-a-workflow
[marketplace-badges]: https://docs.github.com/actions/how-tos/create-and-publish-actions/publish-in-github-marketplace#about-badges-in-github-marketplace
[permissions-docs]: https://docs.github.com/actions/writing-workflows/choosing-what-your-workflow-does/assigning-permissions-to-jobs
[playwright]: https://playwright.dev/
[principle-least-privilege]: https://docs.github.com/actions/security-for-github-actions/security-guides/automatic-token-authentication#permissions-for-the-github_token
[workflow-syntax]: https://docs.github.com/actions/writing-workflows/workflow-syntax-for-github-actions
[workflow-triggers]: https://docs.github.com/actions/writing-workflows/choosing-when-your-workflow-runs/events-that-trigger-workflows
[walkthrough-previous]: 02-code-scanning.md
[walkthrough-next]: 04-caching.md
