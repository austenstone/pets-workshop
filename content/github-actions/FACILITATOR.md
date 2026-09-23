# GitHub Actions Workshop Facilitator Guide

This guide runs the workshop as a 120-minute local event. The attendee path is hands-on through CI, then uses a prepared facilitator demonstration for Azure.

> [!NOTE]
> Workshop workflows and snippets intentionally use the latest stable major action tags so attendees see readable, current examples. `zizmor` will report unpinned action references; that advisory is an accepted demo tradeoff, not a clean-security claim.

## Prerequisites

Complete these checks before attendees arrive:

- Verify the template repository is public and **Use this template** works.
- Confirm GitHub Pages publishes from the `main` branch and `/docs` folder, and open the live attendee guide once.
- Run the Python unit tests, client build, and Playwright suite from a clean clone.
- Confirm GitHub Actions is enabled for attendee repositories. Test Codespaces, github.dev, and a local clone before the session.
- Prepare one clean demo repository with successful **Run Tests** checks already visible.
- Keep the source template's checkpoint branches available after each major exercise so staff can recover an attendee without redoing earlier modules.
- Put the workshop links and support channel in one shared location.
- For the Azure demo, use a dedicated subscription or resource group, a disposable repository, and a tenant where the presenter has the permissions listed below.

Attendees need a GitHub account and basic Git familiarity. They do not need an Azure subscription.

## 120-minute agenda

| Time | Minutes | Activity |
|---|---:|---|
| 00:00-00:10 | 10 | Welcome, learning goals, staff introductions, and preflight |
| 00:10-00:20 | 10 | Create the template repository and choose a workspace |
| 00:20-00:30 | 10 | Create the first workflow and tour the Actions UI |
| 00:30-00:42 | 12 | Review Dependabot, secret scanning defaults, and CodeQL |
| 00:42-01:02 | 20 | Build the Python and Playwright CI workflow |
| 01:02-01:10 | 8 | Add dependency caching |
| 01:10-01:20 | 10 | Add the Python matrix and discuss parallelism |
| 01:20-01:32 | 12 | Facilitator Azure deployment demo |
| 01:32-01:44 | 12 | Build the composite action |
| 01:44-01:54 | 10 | Extract the reusable deployment workflow |
| 01:54-02:00 | 6 | Configure the solo-safe ruleset, recap, and next steps |

## Optional bonus rounds after the core

Do not insert modules 10–13 into the 120-minute agenda. They are independent post-core extensions for extra time, a follow-up session, or a smaller advanced audience.

| Module | Recommended time | Best delivery | Required preflight |
|---|---:|---|---|
| 10: Artifact attestations | 10 minutes | Hands-on | Public repository, current GitHub CLI, and one prepared successful attestation run |
| 11: Environment gates | 10 minutes | Facilitator or paired | Configured `staging` and `production` environments plus an eligible reviewer or timer |
| 12: Concurrency | 10 minutes | Hands-on | Workflow on the default branch and prepared canceled/pending evidence |
| 13: Pages preview | About 10 minutes | Hands-on | Real deployment validated in a disposable public template-created repository |

Every bonus is skippable. If setup or platform timing threatens the room, use its prepared evidence and stop without changing the core route.

Module 13 consumes the target repository's single GitHub Pages site. The source repository must continue publishing this guide from `main:/docs`; never switch `austenstone/pets-workshop` to a workflow-based Pages source. Use an attendee repository or a clearly disposable public validation repository, then disable Pages and delete the validation repository after preflight.

## Staffing for 80 attendees

Use **12 staff**:

- 1 lead facilitator
- 1 producer/timekeeper monitoring chat and room signals
- 8 floor or breakout helpers, one per 10 attendees
- 1 workspace and GitHub authentication specialist
- 1 Azure demo operator

Do not ask the lead facilitator to troubleshoot individual environments while presenting. Assign attendee rows or breakout rooms to named helpers before the session.

## Exact ripcord

At **01:10 elapsed time**, the producer counts attendees with a green **Run Tests** workflow. If fewer than **56 of 80 attendees (70%)** are green, the lead says:

> Ripcord: stop typing and return to the main screen. We are switching the remaining build steps to the prepared repository. Keep your repository; staff will help you finish after the guided walkthrough.

Then:

1. Stop attendee hands-on work after the matrix exercise.
2. Open the prepared demo repository at the last green checkpoint.
3. Demonstrate Azure, custom actions, reusable workflows, and rulesets from that repository.
4. Move helpers to one-to-one recovery without delaying the main presentation.

Do not move the ripcord later than 01:10. The Azure demo and wrap-up need the final 40 minutes.

## Environment fallbacks

Use these fallbacks in order:

1. **Codespaces:** recommend it as the easiest full environment when quota and policy allow it.
2. **github.dev:** support it as a complete terminal-free attendee path. Use the Explorer for file creation, Source Control for commits and pushes, and GitHub.com for Actions, branches, pull requests, and settings.
3. **Local editor:** support a normal clone in VS Code or another editor. Attendees can use either their editor's Source Control UI or local Git commands.
4. **An attendee cannot create a workspace or repository:** pair them with a nearby attendee. Add them as a repository collaborator when policy permits, then use one driver and one navigator, swapping after each exercise.
5. **Organization policy blocks settings:** the attendee observes the facilitator's prepared repository for Advanced Security or ruleset steps and continues with workflow editing.
6. **Widespread outage:** invoke the ripcord immediately and teach from the prepared repository. Do not spend workshop time debugging platform status.

## Recover an attendee from a checkpoint

Repositories created from a template receive the default branch contents, not the source repository's other branches. The `workshop-checkpoint-*` branches are facilitator recovery refs in `austenstone/pets-workshop`; they will not appear automatically in an attendee repository.

Checkpoint recovery copies the workflow and action paths listed below, so it does not depend on guide filenames. Some older checkpoint branches retain the legacy `0-...md` through `9-...md` guide names; use the zero-padded `00-...md` through `09-...md` files on `main` for current attendee navigation.

Use path-scoped recovery so the attendee keeps their repository history and unrelated work:

1. Preserve the attendee's current work before changing files:

    ```bash
    git status --short
    git switch -c "attendee-work-backup-$(date +%Y%m%d-%H%M%S)"
    git add -A
    git commit -m "Save work before workshop checkpoint recovery"
    ```

    If there is nothing to commit, continue. Do not use `git reset --hard`.

2. Add the source template as a separate remote, or verify the existing remote before using it:

    ```bash
    git remote get-url workshop-source || \
      git remote add workshop-source https://github.com/austenstone/pets-workshop.git
    git fetch workshop-source
    ```

3. Inspect the checkpoint before copying anything:

    ```bash
    git ls-tree -r --name-only \
      workshop-source/workshop-checkpoint-03-cache-matrix .github/
    ```

4. Restore only the workshop file needed for that attendee. For example, recover the caching and matrix CI workflow with:

    ```bash
    git restore \
      --source=workshop-source/workshop-checkpoint-03-cache-matrix \
      -- .github/workflows/run-tests.yml
    ```

    Other path-safe recovery targets are `.github/workflows/hello.yml`, `.github/actions/setup-python-env/action.yml`, `.github/workflows/azure-dev.yml`, `.github/workflows/reusable-deploy.yml`, and `.github/workflows/manual-deploy.yml`. Copy only files present in the selected checkpoint; do not restore the repository root or copy the facilitator validation workflow.

5. Review and save the recovery:

    ```bash
    git status --short
    git diff -- .github/workflows/run-tests.yml
    git add -- .github/workflows/run-tests.yml
    git commit -m "Recover workshop checkpoint"
    git push -u origin HEAD
    ```

Replace `run-tests.yml` in the review and staging commands with the exact paths restored in step 4. The attendee can continue on the recovery branch or open a pull request later. During the workshop, prioritize getting them back to the current exercise without rewriting their branch.

## Azure demo plan

### Required presenter permissions

The Azure operator needs:

- An Azure subscription and permission to create the demo resources.
- **Owner**, or **Contributor** plus **User Access Administrator**, at the deployment scope so the pipeline identity can receive role assignments.
- Microsoft Entra permission to create an app registration/service principal and federated identity credential.
- Admin access to the disposable GitHub repository so `azd pipeline config` can create Actions variables and configure the workflow.

### Prepared state

- Authenticate `azd` before the session.
- Keep the generated `infra/` directory and corrected workflow ready on a checkpoint branch.
- Pre-provision once before the event to identify provider-registration or quota failures.
- Record the environment name, resource group, tenant ID, subscription ID, and pipeline application/client ID for cleanup.
- Keep a successful deployment run and live endpoint available in case the live deployment exceeds the 12-minute slot.

### Live sequence

1. Explain the `workflow_run` gate and show checkout of `github.event.workflow_run.head_sha`.
2. Show the generated Bicep and the client `API_SERVER_URL`.
3. Run or summarize `azd pipeline config`, emphasizing OIDC and the required permissions.
4. Show the repository variables without exposing credentials.
5. Open the successful CI run, the triggered deployment run, and the deployed application.
6. If a live command exceeds two minutes, switch to the prepared successful run.

### Cleanup

Immediately after the workshop:

1. Run `azd down --purge --force`.
2. Confirm the resource group and soft-deleted resources are gone.
3. Delete the dedicated Microsoft Entra app registration/service principal and federated credential. `azd down` does not remove pipeline identities.
4. Remove Azure Actions variables and delete the disposable demo repository if it is no longer needed.
