# GitHub Actions Workshop Facilitator Guide

This guide runs the workshop as a 120-minute local event. The attendee path is hands-on through CI, then uses a prepared facilitator demonstration for Azure.

## Prerequisites

Complete these checks before attendees arrive:

- Verify the template repository is public and **Use this template** works.
- Run the Python unit tests, client build, and Playwright suite from a clean clone.
- Confirm GitHub Actions is enabled for attendee repositories and Codespaces quota is available.
- Prepare one clean demo repository with successful **Run Tests** checks already visible.
- Prepare a second checkpoint branch or tag after each major exercise so staff can recover an attendee without redoing earlier modules.
- Put the workshop links and support channel in one shared location.
- For the Azure demo, use a dedicated subscription or resource group, a disposable repository, and a tenant where the presenter has the permissions listed below.

Attendees need a GitHub account and basic Git familiarity. They do not need an Azure subscription.

## 120-minute agenda

| Time | Minutes | Activity |
|---|---:|---|
| 00:00-00:10 | 10 | Welcome, learning goals, staff introductions, and preflight |
| 00:10-00:20 | 10 | Create the template repository and open a codespace |
| 00:20-00:30 | 10 | Create the first workflow and tour the Actions UI |
| 00:30-00:42 | 12 | Review Dependabot, secret scanning defaults, and CodeQL |
| 00:42-01:02 | 20 | Build the Python and Playwright CI workflow |
| 01:02-01:10 | 8 | Add dependency caching |
| 01:10-01:20 | 10 | Add the Python matrix and discuss parallelism |
| 01:20-01:32 | 12 | Facilitator Azure deployment demo |
| 01:32-01:44 | 12 | Build the composite action |
| 01:44-01:54 | 10 | Extract the reusable deployment workflow |
| 01:54-02:00 | 6 | Configure the solo-safe ruleset, recap, and next steps |

## Staffing for 80 attendees

Use **12 staff**:

- 1 lead facilitator
- 1 producer/timekeeper monitoring chat and room signals
- 8 floor or breakout helpers, one per 10 attendees
- 1 Codespaces and GitHub authentication specialist
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

1. **Codespaces starts normally:** each attendee works in their own repository and codespace.
2. **Codespaces is slow or unavailable:** open the repository with `github.dev`, edit and commit workflow files in the browser, and use the GitHub Actions UI for runs. Terminal-only commands become facilitator demonstrations.
3. **An attendee cannot create a codespace or repository:** pair them with a nearby attendee. Add them as a repository collaborator when policy permits, then use one driver and one navigator, swapping after each exercise.
4. **Organization policy blocks settings:** the attendee observes the facilitator's prepared repository for Advanced Security or ruleset steps and continues with workflow editing.
5. **Widespread outage:** invoke the ripcord immediately and teach from the prepared repository. Do not spend workshop time debugging platform status.

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
