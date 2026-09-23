# Deploying to Azure with azd

| [← Matrix Strategies & Parallel Testing][walkthrough-previous] | [Next: Creating custom actions →][walkthrough-next] |
|:-----------------------------------|------------------------------------------:|

With CI in place, it's time for CD — continuous deployment or continuous delivery. We'll use the [Azure Developer CLI (azd)][azd-docs], Microsoft's recommended tool for deploying to Azure. **azd** handles the heavy lifting: generating infrastructure-as-code (Bicep), configuring passwordless authentication (OIDC), and creating the GitHub Actions workflow.

> [!CAUTION]
> **Facilitator demo only.** Attendees should not run the Azure commands in this exercise. `azd pipeline config` requires an Azure subscription, permission to create resources, Microsoft Entra permission to create an application/service principal and federated credential, permission to create Azure role assignments (**Owner**, or **Contributor** plus **User Access Administrator**, at the deployment scope), and repository administration permission to configure Actions variables. The facilitator must use a dedicated demo subscription or resource group and a disposable demo repository.

## Scenario

With the prototype built, the shelter is ready to share their application with the world! They want to deploy automatically whenever code is pushed to `main` — but only after CI passes.

## Background

### Secrets and variables

Speaking of secrets and variables... In a prior exercise you utilized `GITHUB_TOKEN`. `GITHUB_TOKEN` is a special secret automatically available to every workflow, and provides access to the current repository. You can add your own secrets and variables to your repository for use in workflows.

Secrets are exactly that - secret. These are passwords and other values you don't want the public to be able to see. You can add secrets via the CLI, APIs, and your repository's page on github.com. Secrets are write-only, and are only available to be read by a running workflow. In fact, there's even a filter so if the workflow attempts to write or log a secret it'll automatically be hidden. You can confidently add secrets to a public repository, and the only visible aspect will be its name and not the value.

Variables, on the other hand, are designed to be public values. They're settings like URLs or names, or other values that aren't sensitive. Variables can be both read and written. Use variables whenever you need the ability to configure a value outside a workflow.

### Protecting production

There are several strategies for ensuring only validated code reaches production. In a later exercise we'll configure **branch rulesets** to require CI checks and a pull request before code can be merged to `main`. Paired attendees can also require a collaborator's review. Since our deploy workflow only triggers on pushes to `main`, this creates a natural gate: code must pass CI before it can be deployed.

> [!TIP]
> GitHub also supports **environments** with deployment protection rules (like manual approval gates). Environments are a powerful option when you need separate staging and production deployments — but for this workshop, branch rulesets give us the same safety with less setup. See the [environments documentation][environments-docs] to explore that approach on your own.

## Facilitator demo: install and initialize azd

The facilitator sets up the Azure Developer CLI and scaffolds the infrastructure while attendees follow along.

1. In the facilitator's prepared demo codespace, open the terminal (or press <kbd>Ctl</kbd>+<kbd>`</kbd> to toggle it).
2. Install azd by running:

    ```bash
    curl -fsSL https://aka.ms/install-azd.sh | bash
    ```

3. Log in to Azure:

    ```bash
    azd auth login
    ```

    Follow the device code flow — open the URL shown, enter the code, and sign in with your Azure account.

4. Initialize the project by running:

    ```bash
    azd init --from-code
    ```

5. `azd` will scan your project and detect the client and server services. When prompted, select **Confirm and continue initializing my app** to accept the detected services and generate the project configuration.
6. By default, `azd` generates infrastructure in memory at deploy time. To customize the infrastructure, persist it to disk by running:

    ```bash
    azd infra gen
    ```

7. Explore the generated `infra/` directory. You'll see Bicep files (`.bicep`) that define the Azure resources for your application:

    ```bash
    ls infra/
    ```

> [!TIP]
> Bicep is Azure's domain-specific language for defining infrastructure as code. If you have GitHub Copilot, try asking it to explain the generated Bicep files!

The generated `infra/` directory contains several Bicep files that work together:

- **`main.bicep`** — The entry point. It defines the deployment's parameters (like location and environment name) and orchestrates the other files.
- **`main.parameters.json`** — Default parameter values passed to `main.bicep` at deployment time.
- **`resources.bicep`** — The core of the infrastructure. It defines the Azure Container Apps environment and the individual container apps for the client and server, including their Docker images, environment variables, ingress settings, and scaling rules.
- **`modules/`** — Helper modules referenced by the main files (e.g., for fetching container image metadata).
- **`abbreviations.json`** — A lookup table `azd` uses to generate consistent, short resource names following Azure naming conventions.

## Facilitator demo: configure the infrastructure

The generated Bicep files define the Azure Container Apps that will host the client and server. We need to add an environment variable so the client knows where to find the API server.

1. Open `infra/resources.bicep` in your codespace.
2. Find the section (around line 109) that reads:

    ```bicep
    {
      name: 'PORT'
      value: '4321'
    }
    ```

3. Create a new line below the closing `}` and add the following:

    ```bicep
    {
      name: 'API_SERVER_URL'
      value: 'https://${server.outputs.fqdn}'
    }
    ```

> [!NOTE]
> While the syntax resembles JSON, **it's not JSON**. You'll need to resist the natural urge to add commas between the objects!

## Facilitator demo: create the CD workflow

By default, `azd pipeline config` generates a simple workflow that deploys on every push to `main`. That works for getting started, but we want a workflow that only deploys **after CI passes**. If you create the workflow file *first*, `azd` will detect it and configure credentials around your custom workflow instead of generating the default.

Let's create a workflow that:
- Only deploys **after CI passes** — using [`workflow_run`][workflow-run-docs]
- Can also be **triggered manually** via `workflow_dispatch`
- Prevents **conflicting deployments** with concurrency controls

1. Create a new file at `.github/workflows/azure-dev.yml`.
2. Add the following content:

    ```yaml
    name: Deploy App

    on:
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
        runs-on: ubuntu-latest
        if: github.event_name == 'workflow_dispatch' || github.event.workflow_run.conclusion == 'success'
        concurrency:
          group: deploy-production
          cancel-in-progress: false

        steps:
          - uses: actions/checkout@v7
            with:
              ref: ${{ github.event_name == 'workflow_run' && github.event.workflow_run.head_sha || github.sha }}

          - name: Log in with Azure (Federated Credentials)
            uses: Azure/login@v3
            with:
              client-id: ${{ vars.AZURE_CLIENT_ID }}
              tenant-id: ${{ vars.AZURE_TENANT_ID }}
              subscription-id: ${{ vars.AZURE_SUBSCRIPTION_ID }}

          - name: Install azd
            uses: Azure/setup-azd@v2

          - name: Provision and deploy
            run: azd up --no-prompt
            env:
              AZURE_SUBSCRIPTION_ID: ${{ vars.AZURE_SUBSCRIPTION_ID }}
              AZURE_ENV_NAME: ${{ vars.AZURE_ENV_NAME }}
              AZURE_LOCATION: ${{ vars.AZURE_LOCATION }}
    ```

3. Save the file.

Let's walk through the key parts:

- **`permissions: id-token: write`** — In the [Running Tests][running-tests] module you set `contents: read`. Here, `id-token: write` is added because the workflow needs to request OIDC tokens from Azure. This is how passwordless authentication works — no stored credentials, just short-lived tokens.
- **`azure/login`** — Uses the repository's OIDC variables to authenticate with Azure without a password or a hand-written login command.
- **`vars.*`** — Variables like `${{ vars.AZURE_CLIENT_ID }}` reference **repository variables** that `azd pipeline config` will create for you in the next step.
- **`workflow_run`** triggers this workflow whenever the **Run Tests** workflow completes on `main`. The `if` condition ensures it only proceeds when tests **succeeded** — or when triggered manually via `workflow_dispatch`.
- **`actions/checkout`** checks out `github.event.workflow_run.head_sha` for automated deployments, ensuring the deployed commit is the exact commit that passed CI. A manual run checks out the commit selected for that run.
- **`concurrency`** prevents conflicting deployments. Note `cancel-in-progress: false` to avoid accidentally cancelling an active deployment.
- **`azd up`** provisions infrastructure and deploys your application in one command.

## Facilitator demo: set up Azure authentication

The facilitator now lets `azd` configure the pipeline credentials. Because the workflow file already exists, `azd` will configure OIDC and variables around it rather than generating a new one. Attendees should observe rather than authenticate to the facilitator's Azure tenant.

1. Configure the deployment pipeline:

    ```bash
    azd pipeline config
    ```

2. Follow the prompts — here's what to expect:

    | Prompt | What to select |
    |--------|---------------|
    | **Select a provider** | Choose **GitHub** |
    | **Enter a unique environment name** | Enter a short name (e.g., `<HANDLE>-pets-workshop`) — this names your Azure resource group |
    | **Select an Azure subscription** | Choose the subscription you want to deploy to |
    | **Select an Azure location** | Pick a region close to you (e.g., `eastus2`) |
    | **Select how to authenticate the pipeline to Azure** | Choose **Federated Service Principal (SP + OIDC)** |

    After you answer these, `azd` will:
    - Create OIDC credentials in Azure for passwordless authentication
    - Store the necessary secrets and variables in your repository automatically
    - Detect your existing workflow file and configure it

3. When prompted to commit and push local changes, the facilitator confirms the disposable demo repository is selected before saying **yes**.

> [!TIP]
> After `azd pipeline config` completes, navigate to **Settings** > **Secrets and variables** > **Actions** > **Variables** tab to see the repository variables it created (like `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, etc.). These are the `vars.*` values your workflow references.

## Facilitator demo: test the pipeline

When you said **yes** to `azd pipeline config`'s commit prompt, it pushed your changes — including the workflow file. Let's verify everything is working.

1. Navigate to the **Actions** tab. The push will trigger the **Run Tests** workflow first.
2. Once tests complete successfully, the **Deploy App** workflow will start automatically (via the `workflow_run` trigger).
3. Watch the deploy job run — it will provision Azure resources and deploy both the client and server applications.
4. Once the deployment completes return to your codespace.
5. Run the following in the terminal to list the details of your new Azure environment:

    ```bash
    azd show
    ```

6. Look for the **client** service endpoint in the output.
7. Open the client URL in your browser — you should see the pet shelter application live!

## Facilitator cleanup

Cleanup is part of the demo, not an optional follow-up:

1. Record the demo environment name, resource group, and the application/client ID created for the pipeline.
2. From the prepared demo repository, delete the provisioned resources:

    ```bash
    azd down --purge --force
    ```

3. Confirm the resource group and any soft-deleted resources are gone in the Azure portal.
4. Delete the dedicated Microsoft Entra app registration/service principal and its federated credential if `azd pipeline config` created them. `azd down` does not remove pipeline identities.
5. Delete the demo repository's Azure Actions variables and remove the disposable repository if it is no longer needed.

## Summary and next steps

Congratulations! You've deployed the pet shelter application to Azure with a CI/CD pipeline:

- **CI-gated deployment** — CD only runs after CI passes, using `workflow_run`
- **OIDC authentication** — passwordless, short-lived tokens instead of stored credentials
- **Concurrency controls** — preventing conflicting deployments
- **azd integration** — `azd pipeline config` configured credentials around your custom workflow

In a later exercise, we'll add **branch rulesets** to ensure code must pass CI and arrive through a pull request before it can reach `main` — creating a natural production gate.

Next we'll [create custom actions][walkthrough-next] to reduce duplication and make our workflows more maintainable.

## Resources

- [What is the Azure Developer CLI?][azd-docs]
- [Create a custom pipeline definition][azd-pipeline-definition]
- [Events that trigger workflows: workflow_run][workflow-run-docs]
- [About security hardening with OpenID Connect][oidc-docs]
- [Deploying with GitHub Actions][actions-deploy]
- [Using environments for deployment][environments-docs]

| [← Matrix Strategies & Parallel Testing][walkthrough-previous] | [Next: Creating custom actions →][walkthrough-next] |
|:-----------------------------------|------------------------------------------:|

[actions-deploy]: https://docs.github.com/actions/use-cases-and-examples/deploying/deploying-with-github-actions
[azd-docs]: https://learn.microsoft.com/azure/developer/azure-developer-cli/overview
[azd-pipeline-definition]: https://learn.microsoft.com/azure/developer/azure-developer-cli/pipeline-create-definition
[environments-docs]: https://docs.github.com/actions/how-tos/deploy/configure-and-manage-deployments/manage-environments
[oidc-docs]: https://docs.github.com/actions/security-for-github-actions/security-hardening-your-deployments/about-security-hardening-with-openid-connect
[running-tests]: 3-running-tests.md
[workflow-run-docs]: https://docs.github.com/actions/writing-workflows/choosing-when-your-workflow-runs/events-that-trigger-workflows#workflow_run
[walkthrough-previous]: 5-matrix-strategies.md
[walkthrough-next]: 7-custom-actions.md
