# GitHub Actions: From CI to CD

| [← Pets workshop selection][walkthrough-previous] | [Next: Workshop Setup →][walkthrough-next] |
|:-----------------------------------|------------------------------------------:|

[GitHub Actions][github-actions] is a powerful automation platform available right in your GitHub repository. With Actions you can build, test, and deploy your code — and automate just about anything else in your software development lifecycle. This workshop walks you through building a complete CI/CD pipeline, starting with running tests on every push and ending with automated deployment to Azure.

## Scenario

You're a developer, volunteering for a pet adoption shelter. They have a [Flask][flask] API and an [Astro][astro] frontend. They're ready to productionize their app, and deploy it to the cloud! But they also know there's some processes that should be followed to ensure everything flows smoothly. The goal is to work to automate all of those - through the use of GitHub Actions!

## Prerequisites

To complete this workshop, you will need the following:

- A [GitHub account][github-signup]
- Familiarity with Git basics (commit, push, pull)

Azure access is optional. Attendees with an Azure subscription plus the required Azure, Microsoft Entra, role-assignment, and repository administration permissions can complete the deployment exercise. Everyone else can follow the facilitator's prepared deployment and continue with Module 07; skipping the live deployment does not block later modules.

> [!NOTE]
> If you have access to [GitHub Copilot][github-copilot], it can help you write workflow YAML files. You'll see tips throughout the exercises on how to use it effectively.

Facilitators should use the [facilitator guide][facilitator] for timing, staffing, fallbacks, the exact ripcord, and the Azure module plan.

## Exercises

0. [Workshop Setup][setup] — Create your repository from the template
1. [Introduction & Your First Workflow][introduction] — Create your first workflow and explore the Actions UI
2. [Securing the Development Pipeline][code-scanning] — Enable code scanning, Dependabot, and secret scanning
3. [Running Tests][ci] — Automate unit and e2e testing with parallel jobs
4. [Caching][marketplace] — Speed up workflows by caching dependencies
5. [Matrix strategies & parallel testing][matrix] — Test across multiple configurations simultaneously
6. [Deploying to Azure with azd][deployment] — Set up continuous deployment to Azure
7. [Creating custom actions][custom-actions] — Build your own reusable action
8. [Reusable workflows][reusable-workflows] — Share workflow logic across repositories
9. [Required workflows, protection & wrap-up][protection] — Enforce standards and protect your branches

## Optional bonus rounds

Modules 10–13 are independent extensions after the core route. They are **not part of the 120-minute workshop schedule**. Pick any one when time, repository access, and audience interest allow; skipping one never blocks another.

10. [Artifact attestations and provenance][attestations] — 5, 10, or 15 minutes; build and verify signed provenance
11. [Environments and deployment gates][deployment-gates] — 5, 10, or 15 minutes; pause a simulated promotion for a timer or reviewer
12. [Concurrency cancellation and retained queues][concurrency] — 5, 10, or 15 minutes; compare canceling stale work with serial production queues
13. [GitHub Pages static preview][pages-preview] — about 10 minutes; deploy a pre-baked SQLite-to-JSON Astro snapshot from an attendee repository

Each bonus documents prerequisites, settings outside the workflow, a facilitator fallback, reset steps, failure modes, and current validation status. Module 13 uses the attendee repository's one free Pages site. Do not run it in `austenstone/pets-workshop`, whose Pages source must remain `main:/docs`.

## Resources

- [GitHub Actions documentation][github-actions-docs]
- [GitHub Actions Marketplace][actions-marketplace]
- [Workflow syntax reference][workflow-syntax]
- [Azure Developer CLI (azd) documentation][azd-docs]

| [← Pets workshop selection][walkthrough-previous] | [Next: Workshop Setup →][walkthrough-next] |
|:-----------------------------------|------------------------------------------:|

[actions-marketplace]: https://github.com/marketplace?type=actions
[attestations]: ./10-artifact-attestations.md
[astro]: https://astro.build/
[azure-free]: https://azure.microsoft.com/free/
[azd-docs]: https://learn.microsoft.com/azure/developer/azure-developer-cli/overview
[ci]: ./03-running-tests.md
[code-scanning]: ./02-code-scanning.md
[custom-actions]: ./07-custom-actions.md
[concurrency]: ./12-concurrency-and-cancellation.md
[deployment]: ./06-deploy-azure.md
[deployment-gates]: ./11-environments-and-deployment-gates.md
[facilitator]: ./FACILITATOR.md
[flask]: https://flask.palletsprojects.com/
[github-actions]: https://github.com/features/actions
[github-actions-docs]: https://docs.github.com/actions
[github-copilot]: https://github.com/features/copilot
[github-signup]: https://github.com/join
[introduction]: ./01-introduction.md
[marketplace]: ./04-caching.md
[matrix]: ./05-matrix-strategies.md
[pages-preview]: ./13-github-pages-preview.md
[protection]: ./09-required-workflows.md
[reusable-workflows]: ./08-reusable-workflows.md
[setup]: ./00-setup.md
[walkthrough-next]: ./00-setup.md
[walkthrough-previous]: ../README.md
[workflow-syntax]: https://docs.github.com/actions/writing-workflows/workflow-syntax-for-github-actions
