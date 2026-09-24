# Reusable Workflows

| [← Creating Custom Actions][walkthrough-previous] | [Next: Required Workflows, Protection & Wrap-Up →][walkthrough-next] |
|:-----------------------------------|------------------------------------------:|

Reusable workflows let you define an entire workflow that other workflows can call, like a function. This is different from custom actions — actions encapsulate individual *steps*, while reusable workflows encapsulate entire *jobs*. They're triggered with the `workflow_call` event and can accept inputs, secrets, and produce outputs.

In this exercise you'll extract the deployment pattern into a reusable workflow, then call it from both your CD pipeline and a new manual deployment workflow for rollbacks and hotfixes.

## Scenario

The shelter's deploy workflow is working — code that passes CI on `main` gets deployed automatically. But what happens when something goes wrong in production and you need to quickly roll back to a known-good version? Or deploy a hotfix from a specific commit? Right now, the only option is to push to `main` and wait for CI. Let's create a manual deployment workflow that lets the team deploy any git ref on demand, and extract the shared deploy logic into a reusable workflow so both pipelines stay in sync.

## Background

In the [previous exercise][walkthrough-previous] you created a composite action to bundle steps together. Reusable workflows solve a similar problem — avoiding duplication — but at a different level. It's important to understand when to reach for each one.

A **composite action** combines multiple *steps* into a single step that runs inside a job. A **reusable workflow** packages one or more entire *jobs* that a caller workflow references at the job level. Here's a side-by-side comparison:

| | Composite Action | Reusable Workflow |
|---|---|---|
| **What it encapsulates** | Multiple steps, run as a single step | One or more complete jobs |
| **Where it lives** | `action.yml` in any directory (e.g. `.github/actions/`) | `.github/workflows/` directory only |
| **How it's called** | `uses:` inside a job's `steps` | `uses:` directly on a `job`, not inside steps |
| **Runner control** | Runs on the caller job's runner | Each job specifies its own runner |
| **Secrets** | Cannot access secrets directly | Can receive explicitly declared secrets from callers |
| **Logging** | Appears as one collapsed step in the log | Every job and step is logged individually |
| **Nesting depth** | Up to 10 composite actions per workflow | Up to 10 levels of workflow nesting |
| **Marketplace** | Can be published to the [Actions Marketplace][actions-marketplace] | Cannot be published to the Marketplace |

**When to use which:**

- Choose a **composite action** when you want to bundle a handful of related steps that run within a single job — like the `setup-python-env` action you just built.
- Choose a **reusable workflow** when you want to share entire job definitions — including runner selection, environment targeting, and concurrency controls — across multiple workflows. Deployment pipelines are a classic use case, which is exactly what we'll build next.

## Understanding authentication in reusable workflows

Reusable workflows can receive explicitly declared secrets from callers, but this deployment does not need any Azure credential secret. The same-repository reusable workflow reads the five non-secret `AZURE_*` repository variables created in Module 06 and requests a short-lived Azure token with GitHub OIDC. Keep the permission and variable boundary explicit; do not forward unrelated secrets.

## Create a reusable deployment workflow

Let's extract the shared deploy steps into a reusable workflow. The workflow requires a `deploy-ref` input so every caller explicitly identifies the commit, tag, or branch to deploy.

1. In your workspace, create a new file at `.github/workflows/reusable-deploy.yml`.

2. Define the `workflow_call` trigger with an input for the git ref to deploy:

    ```yaml
    name: Reusable Deploy Workflow

    on:
      workflow_call:
        inputs:
          deploy-ref:
            description: 'Git ref to deploy (commit SHA, tag, or branch).'
            required: true
            type: string

    permissions:
      id-token: write
      contents: read
    ```

3. Add a single job that checks out the code, authenticates with Azure, and deploys:

    ```yaml
    jobs:
      deploy:
        runs-on: ubuntu-latest
        concurrency:
          group: deploy-production
          cancel-in-progress: false
        steps:
          - name: Checkout code
            uses: actions/checkout@v7
            with:
              ref: ${{ inputs.deploy-ref }}
              persist-credentials: false

          - name: Install azd
            uses: Azure/setup-azd@v2

          - name: Log in with Azure (Federated Credentials)
            run: |
              azd auth login \
                --client-id "$AZURE_CLIENT_ID" \
                --federated-credential-provider github \
                --tenant-id "$AZURE_TENANT_ID"
            env:
              AZURE_CLIENT_ID: ${{ vars.AZURE_CLIENT_ID }}
              AZURE_TENANT_ID: ${{ vars.AZURE_TENANT_ID }}

          - name: Deploy application
            run: azd up --no-prompt
            env:
              AZURE_SUBSCRIPTION_ID: ${{ vars.AZURE_SUBSCRIPTION_ID }}
              AZURE_ENV_NAME: ${{ vars.AZURE_ENV_NAME }}
              AZURE_LOCATION: ${{ vars.AZURE_LOCATION }}
    ```

> [!NOTE]
> Reusable workflows have a few important limitations: a call chain can contain a maximum of 10 workflow levels total — the top-level caller plus up to nine reusable workflows — and each reusable workflow file must be located in the `.github/workflows` directory. Reusable workflows are called at the job level, not from a job's `steps`.

## Update the CD workflow

Now update your `azure-dev.yml` to call the reusable workflow instead of defining the deploy steps inline.

1. Replace the contents of `.github/workflows/azure-dev.yml` with:

    ```yaml
    name: Deploy App

    on: # zizmor: ignore[dangerous-triggers]
      workflow_dispatch:
      workflow_run:
        workflows: ["Run Tests"]
        branches: [main]
        types: [completed]

    permissions:
      id-token: write
      contents: read

    jobs:
      deploy:
        if: >-
          github.event_name == 'workflow_dispatch' ||
          (github.event.workflow_run.conclusion == 'success' &&
          github.event.workflow_run.event == 'push' &&
          github.event.workflow_run.head_repository.full_name == github.repository &&
          github.event.workflow_run.head_branch == github.event.repository.default_branch)
        uses: ./.github/workflows/reusable-deploy.yml
        with:
          deploy-ref: ${{ github.event_name == 'workflow_run' && github.event.workflow_run.head_sha || github.sha }}
    ```

    Notice how the entire job definition is replaced by a single `uses:` reference. The caller accepts automated deployment only from a successful same-repository push to the default branch, then passes `github.event.workflow_run.head_sha` so the reusable workflow checks out the exact commit that passed CI rather than whichever commit is currently at the tip of `main`. Manual runs use the commit selected for that run. The narrowly scoped `zizmor` suppression is safe only while this trust boundary remains in place.

## Create a manual deploy workflow

Now let's add the second caller — a manual deploy workflow for rollbacks and hotfixes. This is where the reusable workflow really earns its keep: same deploy logic, different trigger.

1. Create a new file at `.github/workflows/manual-deploy.yml`.
2. Add the following content:

    ```yaml
    name: Manual Deploy

    on:
      workflow_dispatch:
        inputs:
          deploy-ref:
            description: 'Git ref to deploy (commit SHA, tag, or branch)'
            required: true
            default: 'main'

    permissions:
      id-token: write
      contents: read

    jobs:
      deploy:
        uses: ./.github/workflows/reusable-deploy.yml
        with:
          deploy-ref: ${{ inputs.deploy-ref }}
    ```

    This workflow is only triggered **manually** via `workflow_dispatch` — it appears as a "Run workflow" button in the Actions tab. It prompts for a **git ref** (a commit SHA, tag, or branch name to deploy), passes that ref to the reusable workflow's `deploy-ref` input, and uses the same deploy logic as the automated pipeline.

3. Use your editor's **Source Control** view to stage the three workflow files, enter `Extract reusable deploy workflow and add manual deploy`, commit, and push or sync. If you have a terminal, the equivalent commands are:

    ```bash
    git add .github/workflows/reusable-deploy.yml .github/workflows/azure-dev.yml .github/workflows/manual-deploy.yml
    git commit -m "Extract reusable deploy workflow and add manual deploy"
    git push
    ```

4. Navigate to the **Actions** tab on GitHub and verify that the deploy workflow runs successfully. You should also see **Manual Deploy** in the workflow list — try clicking **Run workflow** to test deploying a specific ref.

> [!TIP]
> When viewing a workflow run that calls reusable workflows, GitHub shows each caller job separately. Select a job to see the steps from the reusable workflow running inside it.

This pattern keeps your deployment logic in one place. When you need to update the deployment process — like adding health checks or notifications — you change it once in the reusable workflow and every caller benefits.

## Summary and next steps

Reusable workflows reduce duplication at the workflow level. You've extracted the shared deployment pattern into a template that both the automated CD pipeline and the manual deploy workflow call with a single `uses` reference. This keeps your deployment process maintainable as it grows — any change happens in one place.

Next, we'll ensure quality gates are enforced with [branch protection, required workflows, and more][walkthrough-next].

## Resources

- [Reusing workflows][reusing-workflows]
- [The `workflow_call` event][workflow-call-event]
- [Sharing workflows with your organization][sharing-workflows]
- [GitHub Skills: Reusable workflows][skills-reusable-workflows]

| [← Creating Custom Actions][walkthrough-previous] | [Next: Required Workflows, Protection & Wrap-Up →][walkthrough-next] |
|:-----------------------------------|------------------------------------------:|

[actions-marketplace]: https://github.com/marketplace?type=actions
[reusing-workflows]: https://docs.github.com/actions/sharing-automations/reusing-workflows
[sharing-workflows]: https://docs.github.com/actions/how-tos/reuse-automations/reuse-workflows#sharing-workflows
[skills-reusable-workflows]: https://github.com/skills/reusable-workflows
[workflow-call-event]: https://docs.github.com/actions/writing-workflows/choosing-when-your-workflow-runs/events-that-trigger-workflows#workflow_call
[walkthrough-previous]: 07-custom-actions.md
[walkthrough-next]: 09-required-workflows.md
