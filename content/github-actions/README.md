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

Azure access is not required for attendees. The Azure deployment exercise is a facilitator-led demo because its setup requires Azure, Microsoft Entra, role-assignment, and repository administration permissions.

> [!NOTE]
> If you have access to [GitHub Copilot][github-copilot], it can help you write workflow YAML files. You'll see tips throughout the exercises on how to use it effectively.

Facilitators should use the [facilitator guide][facilitator] for timing, staffing, fallbacks, the exact ripcord, and the Azure demo plan.

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

## Resources

- [GitHub Actions documentation][github-actions-docs]
- [GitHub Actions Marketplace][actions-marketplace]
- [Workflow syntax reference][workflow-syntax]
- [Azure Developer CLI (azd) documentation][azd-docs]

| [← Pets workshop selection][walkthrough-previous] | [Next: Workshop Setup →][walkthrough-next] |
|:-----------------------------------|------------------------------------------:|

[actions-marketplace]: https://github.com/marketplace?type=actions
[astro]: https://astro.build/
[azure-free]: https://azure.microsoft.com/free/
[azd-docs]: https://learn.microsoft.com/azure/developer/azure-developer-cli/overview
[ci]: ./3-running-tests.md
[code-scanning]: ./2-code-scanning.md
[custom-actions]: ./7-custom-actions.md
[deployment]: ./6-deploy-azure.md
[facilitator]: ./FACILITATOR.md
[flask]: https://flask.palletsprojects.com/
[github-actions]: https://github.com/features/actions
[github-actions-docs]: https://docs.github.com/actions
[github-copilot]: https://github.com/features/copilot
[github-signup]: https://github.com/join
[introduction]: ./1-introduction.md
[marketplace]: ./4-caching.md
[matrix]: ./5-matrix-strategies.md
[protection]: ./9-required-workflows.md
[reusable-workflows]: ./8-reusable-workflows.md
[setup]: ./0-setup.md
[walkthrough-next]: ./0-setup.md
[walkthrough-previous]: ../README.md
[workflow-syntax]: https://docs.github.com/actions/writing-workflows/workflow-syntax-for-github-actions
