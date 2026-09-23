# Introduction & Your First Workflow

| [← Workshop Setup][walkthrough-previous] | [Next: Securing the Development Pipeline →][walkthrough-next] |
|:-----------------------------------|------------------------------------------:|

[GitHub Actions][github-actions] is an automation platform built into GitHub that lets you build, test, and deploy your code directly from your repository. While it's most commonly used for CI/CD, it can automate just about any task in your development workflow — from labeling issues to resizing images.

Before diving in, here are the key terms you'll encounter:

- **Workflow**: An automated process defined in a YAML file, stored in `.github/workflows/`.
- **Event**: A trigger that starts a workflow, such as a `push`, `pull_request`, or `workflow_dispatch`.
- **Job**: A set of steps that run on the same runner. Jobs run in parallel by default.
- **Step**: An individual task within a job — either a shell command (`run`) or a reusable action (`uses`).
- **Runner**: The virtual machine that executes your jobs (e.g., `ubuntu-latest`).
- **Action**: A reusable unit of code that performs a specific task, published on the [Actions Marketplace][actions-marketplace].

## Scenario

The shelter has built its application — a Flask API and Astro frontend — and the team is ready to start automating their development workflow. Before diving into CI/CD, let's start with the basics: creating a simple workflow, triggering it manually, and understanding the logs.

## Background

A workflow file is written in YAML and lives in the `.github/workflows/` directory. Here are the core sections you'll work with:

- `name`: A human-readable name for the workflow, displayed in the **Actions** tab.
- `on`: Defines the events that trigger the workflow (e.g., `push`, `pull_request`, `workflow_dispatch`).
- `jobs`: Contains one or more jobs, each with a unique identifier.
  - `runs-on`: Specifies the runner environment (e.g., `ubuntu-latest`).
  - `steps`: An ordered list of tasks the job performs.
    - `uses`: References a reusable action (e.g., `actions/checkout@v7`).
    - `run`: Executes a shell command.

## Create your first workflow

Let's start with the classic "Hello World" — a workflow you can trigger manually from the GitHub UI.

1. In your workspace, create a new file named `.github/workflows/hello.yml`. Your editor can create the parent folders when you enter the full path.
2. Add the following content:

    ```yaml
    name: Hello World

    on:
      workflow_dispatch:

    jobs:
      greet:
        runs-on: ubuntu-latest

        steps:
          - name: Say hello
            run: echo "Hello, GitHub Actions!"

          - name: Show environment info
            run: |
              echo "Runner OS: $RUNNER_OS"
              echo "Repository: $GITHUB_REPOSITORY"
              echo "Triggered by: $GITHUB_ACTOR"
    ```

3. Save the file.

> [!NOTE]
> The `workflow_dispatch` event lets you trigger the workflow manually from the **Actions** tab. This is useful for testing workflows without needing to push code changes every time.

## Push and run

Now let's push the workflow and trigger it by hand.

1. Use your editor's **Source Control** view to stage `hello.yml`, enter `Add hello world workflow`, commit, and push or sync. If you have a terminal, the equivalent commands are:

    ```bash
    git add .github/workflows/hello.yml
    git commit -m "Add hello world workflow"
    git push
    ```

2. Navigate to your repository on GitHub and select the **Actions** tab.
3. In the left sidebar, select the **Hello World** workflow.
4. Select the **Run workflow** button, keep the default branch, and select **Run workflow** again to confirm.

## Explore the logs

Once the run completes, let's explore what happened.

1. Select the workflow run that just completed.
2. Select the **greet** job to expand it.
3. Explore the logs for each step:
   - **Say hello** — you'll see the `echo` output.
   - **Show environment info** — notice the environment variables that GitHub Actions provides automatically (`RUNNER_OS`, `GITHUB_REPOSITORY`, `GITHUB_ACTOR`).
4. Also look at the **Set up job** and **Complete job** steps that Actions adds automatically — these show the runner setup and cleanup.

> [!TIP]
> You can search within the logs using the search box at the top of the log viewer, and expand or collapse individual steps. This becomes very useful as workflows grow more complex.

## Summary and next steps

Congratulations! You've created and run your first GitHub Actions workflow. You've learned how to define a workflow in YAML, trigger it manually with `workflow_dispatch`, and navigate the logs in the Actions UI.

Next, we'll put this knowledge to work by [securing the development pipeline][walkthrough-next] with code scanning, Dependabot, and secret scanning.

## Resources

- [GitHub Actions documentation][github-actions-docs]
- [Workflow syntax for GitHub Actions][workflow-syntax]
- [Events that trigger workflows][workflow-triggers]
- [Understanding GitHub Actions][understanding-actions]

| [← Workshop Setup][walkthrough-previous] | [Next: Securing the Development Pipeline →][walkthrough-next] |
|:-----------------------------------|------------------------------------------:|

[actions-marketplace]: https://github.com/marketplace?type=actions
[github-actions]: https://github.com/features/actions
[github-actions-docs]: https://docs.github.com/actions
[understanding-actions]: https://docs.github.com/actions/about-github-actions/understanding-github-actions
[workflow-syntax]: https://docs.github.com/actions/writing-workflows/workflow-syntax-for-github-actions
[workflow-triggers]: https://docs.github.com/actions/writing-workflows/choosing-when-your-workflow-runs/events-that-trigger-workflows
[walkthrough-previous]: 00-setup.md
[walkthrough-next]: 02-code-scanning.md
