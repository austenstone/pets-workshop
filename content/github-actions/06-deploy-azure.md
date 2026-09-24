# Deploying to Azure with azd

| [← Matrix Strategies & Parallel Testing][walkthrough-previous] | [Next: Creating custom actions →][walkthrough-next] |
|:-----------------------------------|------------------------------------------:|

With CI in place, it's time for CD — continuous deployment or continuous delivery. We'll use the [Azure Developer CLI (azd)][azd-docs], Microsoft's recommended tool for deploying to Azure. **azd** handles the heavy lifting: generating infrastructure-as-code (Bicep), configuring passwordless authentication (OIDC), and creating the GitHub Actions workflow.

> [!IMPORTANT]
> You can complete this deployment if you have an Azure subscription, repository administration permission, and Microsoft Entra permission to create an application, service principal, and federated credential. Your effective Azure permissions must allow resource creation and `Microsoft.Authorization/roleAssignments/write` after `notActions` is applied. In practice, use **Owner** or equivalent resource-write plus role-assignment authority at the deployment scope. `azd pipeline config` grants the new pipeline identity **Contributor** and **User Access Administrator** at the selected subscription by default. If your tenant's `allowedToCreateApps` policy is disabled, you need an Entra role or administrator assistance that permits app registration. Without these capabilities, follow the facilitator's prepared deployment and continue to Module 07; skipping live deployment does not block later modules.

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

## Verify your accounts and install azd

Before creating anything, confirm that the repository and cloud accounts belong to you and that you intend to use them for this workshop.

1. Open a terminal in your workspace and verify the GitHub repository:

    ```bash
    git remote get-url origin
    gh auth status
    gh repo view --json nameWithOwner,url
    ```

    Stop if these commands do not show your attendee repository and an account with repository administration permission.

2. Install `azd` without requiring `sudo`:

    ```bash
    mkdir -p "$HOME/.local/bin"
    curl -fsSL https://aka.ms/install-azd.sh |
      bash -s -- --install-folder "$HOME/.local/bin"
    export PATH="$HOME/.local/bin:$PATH"
    azd version
    ```

3. Log in to Azure:

    ```bash
    azd auth login
    ```

    Complete the browser or device-code flow shown by `azd`.

4. Verify that `azd` is using the intended account and tenant:

    ```bash
    azd auth status
    ```

    `azd` and the Azure CLI (`az`) maintain separate authentication contexts. `az account show` does not confirm which identity or tenant `azd` will use. If `azd auth status` shows the wrong account, run `azd auth logout`, sign in again, and recheck before continuing.

## Initialize azd

1. Initialize the project:

    ```bash
    azd init --from-code
    ```

2. `azd` will scan your project and detect the client and server services. When prompted, select **Confirm and continue initializing my app** to accept the detected services and generate the project configuration.
3. By default, `azd` generates infrastructure in memory at deploy time. To customize the infrastructure, persist it to disk:

    ```bash
    azd infra gen
    ```

4. Explore the generated `infra/` directory:

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

## Configure the infrastructure

The generated Bicep files define the Azure Container Apps that will host the client and server. We need to add an environment variable so the client knows where to find the API server.

1. Open `infra/resources.bicep` in your workspace.
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

## Create the CD workflow

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
        if: >-
          github.event_name == 'workflow_dispatch' ||
          (github.event.workflow_run.conclusion == 'success' &&
          github.event.workflow_run.event == 'push' &&
          github.event.workflow_run.head_repository.full_name == github.repository &&
          github.event.workflow_run.head_branch == github.event.repository.default_branch)
        concurrency:
          group: deploy-production
          cancel-in-progress: false

        steps:
          - uses: actions/checkout@v7
            with:
              ref: ${{ github.event_name == 'workflow_run' && github.event.workflow_run.head_sha || github.sha }}
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
- **`vars.*`** — Variables like `${{ vars.AZURE_CLIENT_ID }}` reference **repository variables** that `azd pipeline config` will create for you in the next step.
- **`workflow_run`** triggers whenever **Run Tests** completes on `main`, but the privileged job proceeds only for a successful same-repository push to the default branch. Pull requests and forks cannot reach its OIDC permission. Manual `workflow_dispatch` runs remain available.
- **Exact tested commit** — Automated deployment checks out `github.event.workflow_run.head_sha`, the exact commit CI tested. A manual run uses the commit selected for that run.
- **`persist-credentials: false`** — Checkout does not leave its GitHub token in local Git configuration for later deployment steps.
- **`concurrency`** prevents conflicting deployments. Note `cancel-in-progress: false` to avoid accidentally cancelling an active deployment.
- **Federated `azd auth login`** — The workflow authenticates `azd` itself with a short-lived GitHub OIDC token. Authenticating another Azure tool does not automatically authenticate `azd`.
- **`azd up`** provisions infrastructure and deploys your application in one command.

## Set up Azure authentication

Now let `azd` configure the pipeline identity. Because the workflow file already exists, `azd` configures OIDC and repository variables around it instead of generating a different deployment workflow.

1. Choose a unique environment name, then configure the GitHub pipeline explicitly with federated authentication:

    ```bash
    AZD_ENVIRONMENT_NAME="<YOUR_UNIQUE_ENVIRONMENT_NAME>"
    azd pipeline config \
      --provider github \
      --auth-type federated \
      --environment "$AZD_ENVIRONMENT_NAME"
    ```

2. Follow the prompts — here's what to expect:

    | Prompt | What to select |
    |--------|---------------|
    | **Environment** | Confirm the unique environment name supplied in the command |
    | **Select an Azure subscription** | Explicitly choose the intended subscription; do not rely on an Azure CLI default |
    | **Select an Azure location** | Pick a supported region with available Container Apps and registry quota (for example, `eastus2`) |
    | **Select how to authenticate the pipeline to Azure** | Choose **Federated Service Principal (SP + OIDC)**, not the default managed-identity option |
    | **Choose federated credential subjects** | Review the repository and detected subjects, then choose **Use detected subjects (Recommended)** for the workshop only if they match the branches and pull-request trust you intend |

> [!WARNING]
> If you accidentally select Azure DevOps or see an unexpected Azure DevOps create/configure prompt, answer **No**, press <kbd>Ctrl</kbd>+<kbd>C</kbd> to cancel, and rerun the explicit GitHub command above. If you answered **No**, no Azure DevOps cleanup is needed because nothing was created or configured.

    After you answer these, `azd` will:
    - Create a dedicated application, service principal, and federated credentials for passwordless authentication
    - Grant the pipeline identity **Contributor** and **User Access Administrator** on the selected subscription by default
    - Store `AZURE_CLIENT_ID`, `AZURE_ENV_NAME`, `AZURE_LOCATION`, `AZURE_SUBSCRIPTION_ID`, and `AZURE_TENANT_ID` as repository variables
    - Detect your existing workflow file and configure it

3. Before accepting the commit-and-push prompt, run `git remote get-url origin`, review the generated files with `git status` and `git diff`, and confirm the repository, account, tenant, subscription, region, and federated subjects one more time. Then say **yes** if all of them are correct.

> [!TIP]
> `azd` may print a generic message saying GitHub Action “secrets” were configured. This OIDC path creates the five variables above and no client secret. Verify the exact account and subscription before deployment:
>
> ```bash
> azd auth status
> gh repo view --json nameWithOwner,url
> printf 'Pipeline tenant: '
> gh variable get AZURE_TENANT_ID
> printf 'Pipeline subscription: '
> gh variable get AZURE_SUBSCRIPTION_ID
> gh variable list
> ```

## Test the pipeline

When you said **yes** to `azd pipeline config`'s commit prompt, it pushed your changes — including the workflow file. Let's verify everything is working.

1. Navigate to the **Actions** tab. The push will trigger the **Run Tests** workflow first.
2. Once tests complete successfully, the **Deploy App** workflow will start automatically (via the `workflow_run` trigger).
3. Watch the deploy job run — it will provision Azure resources and deploy both the client and server applications.
4. Once the deployment completes, return to your workspace.
5. List the details of the new Azure environment:

    ```bash
    azd show
    ```

6. Record both the **client** and **server** service endpoints from the output.
7. Open the client URL and confirm the page displays **Welcome to Tailspin Shelter**, **Available Dogs**, and dog cards loaded from the API.
8. Verify the client root, a dog detail page, and the full API response. Replace the two placeholders with the endpoints from `azd show`:

    ```bash
    CLIENT_URL="https://CLIENT_ENDPOINT"
    SERVER_URL="https://SERVER_ENDPOINT"
    CLIENT_URL="${CLIENT_URL%/}"
    SERVER_URL="${SERVER_URL%/}"
    DOGS_JSON="$(mktemp)"
    trap 'rm -f "$DOGS_JSON"' EXIT

    curl -fsSL "$SERVER_URL/api/dogs?per_page=100" >"$DOGS_JSON"
    DOG_ID="$(jq -er '.dogs[0].id' "$DOGS_JSON")"
    DOG_NAME="$(jq -er '.dogs[0].name' "$DOGS_JSON")"
    jq -e \
      '(.dogs | length) == 100 and
       (.dogs[0] | has("id") and has("name") and has("breed"))' \
      "$DOGS_JSON"
    curl -fsSL "$CLIENT_URL/" |
      rg -F 'Welcome to Tailspin Shelter'
    curl -fsSL "$CLIENT_URL/" |
      rg -F "$DOG_NAME"
    curl -fsSL "$CLIENT_URL/dog/$DOG_ID" |
      rg -F "$DOG_NAME"

    rm -f "$DOGS_JSON"
    trap - EXIT
    ```

The rehearsal completed this OIDC and Container Apps deployment in 4 minutes 4 seconds. Treat that as validation, not a duration guarantee: provider registration, image builds, regional capacity, and network conditions vary.

## Cleanup

Cleanup includes more than deleting the Container Apps. `azd down` removes provisioned resources, but it does not remove the pipeline's Azure role assignments, Microsoft Entra application/service principal/federated credentials, or GitHub variables.

1. Capture the identifiers before deleting anything, then select the environment explicitly:

    ```bash
    AZURE_CLIENT_ID="$(gh variable get AZURE_CLIENT_ID)"
    AZURE_ENV_NAME="$(gh variable get AZURE_ENV_NAME)"
    AZURE_SUBSCRIPTION_ID="$(gh variable get AZURE_SUBSCRIPTION_ID)"
    AZURE_TENANT_ID="$(gh variable get AZURE_TENANT_ID)"
    azd env select "$AZURE_ENV_NAME"
    AZURE_RESOURCE_GROUP="$(azd env get-value AZURE_RESOURCE_GROUP)"
    ```

2. Remove the deployed resources. Omit `--force --no-prompt` if you prefer an interactive confirmation:

    ```bash
    azd down \
      -e "$AZURE_ENV_NAME" \
      --purge \
      --force \
      --no-prompt
    ```

    Azure resource-group deletion is asynchronous. Do not continue until this prints `false`:

    ```bash
    az group exists \
      --name "$AZURE_RESOURCE_GROUP" \
      --subscription "$AZURE_SUBSCRIPTION_ID"
    ```

3. Authenticate the separate Azure CLI context to the same tenant and subscription, then resolve the pipeline service principal:

    ```bash
    az login --tenant "$AZURE_TENANT_ID"
    az account set --subscription "$AZURE_SUBSCRIPTION_ID"
    AZURE_SP_OBJECT_ID="$(
      az ad sp show --id "$AZURE_CLIENT_ID" --query id -o tsv
    )"
    ```

4. Inspect and remove only this pipeline identity's **Contributor** and **User Access Administrator** assignments at the selected subscription:

    ```bash
    AZURE_SCOPE="/subscriptions/$AZURE_SUBSCRIPTION_ID"
    ROLE_ASSIGNMENT_IDS="$(
      az role assignment list \
        --assignee-object-id "$AZURE_SP_OBJECT_ID" \
        --scope "$AZURE_SCOPE" \
        --query \
          "[?roleDefinitionName=='Contributor' ||
             roleDefinitionName=='User Access Administrator'].id" \
        -o tsv
    )"

    while IFS= read -r assignment_id; do
      [ -z "$assignment_id" ] ||
        az role assignment delete --ids "$assignment_id"
    done <<< "$ROLE_ASSIGNMENT_IDS"
    ```

5. Delete the federated credentials, service principal, and app registration:

    ```bash
    az ad app federated-credential list \
      --id "$AZURE_CLIENT_ID" \
      --query '[].id' -o tsv |
      while IFS= read -r credential_id; do
        az ad app federated-credential delete \
          --id "$AZURE_CLIENT_ID" \
          --federated-credential-id "$credential_id"
      done

    test "$(
      az ad app federated-credential list \
        --id "$AZURE_CLIENT_ID" \
        --query 'length(@)' -o tsv
    )" = "0"
    az ad sp delete --id "$AZURE_SP_OBJECT_ID"
    az ad app delete --id "$AZURE_CLIENT_ID"
    ```

6. Delete exactly the five repository variables created for this deployment:

    ```bash
    for variable in \
      AZURE_CLIENT_ID \
      AZURE_ENV_NAME \
      AZURE_LOCATION \
      AZURE_SUBSCRIPTION_ID \
      AZURE_TENANT_ID
    do
      gh variable delete "$variable"
    done
    ```

7. Independently confirm the resources, access, identities, and variables are gone:

    ```bash
    test "$(
      az group exists \
        --name "$AZURE_RESOURCE_GROUP" \
        --subscription "$AZURE_SUBSCRIPTION_ID"
    )" = "false"
    test "$(
      az resource list \
        --subscription "$AZURE_SUBSCRIPTION_ID" \
        --tag "azd-env-name=$AZURE_ENV_NAME" \
        --query 'length(@)' -o tsv
    )" = "0"
    test "$(
      az role assignment list \
        --assignee-object-id "$AZURE_SP_OBJECT_ID" \
        --scope "$AZURE_SCOPE" \
        --query 'length(@)' -o tsv
    )" = "0"
    test "$(
      az ad app list \
        --filter "appId eq '$AZURE_CLIENT_ID'" \
        --query 'length(@)' -o tsv
    )" = "0"
    test "$(
      az ad sp list \
        --filter "appId eq '$AZURE_CLIENT_ID'" \
        --query 'length(@)' -o tsv
    )" = "0"

    for variable in \
      AZURE_CLIENT_ID \
      AZURE_ENV_NAME \
      AZURE_LOCATION \
      AZURE_SUBSCRIPTION_ID \
      AZURE_TENANT_ID
    do
      ! gh variable get "$variable" >/dev/null 2>&1
    done
    ```

## Summary and next steps

You have now deployed, or followed the deployment of, the pet shelter application with a CI/CD pipeline:

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
[running-tests]: 03-running-tests.md
[workflow-run-docs]: https://docs.github.com/actions/writing-workflows/choosing-when-your-workflow-runs/events-that-trigger-workflows#workflow_run
[walkthrough-previous]: 05-matrix-strategies.md
[walkthrough-next]: 07-custom-actions.md
