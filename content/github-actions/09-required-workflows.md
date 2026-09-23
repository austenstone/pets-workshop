# Rulesets, Required Workflows & Wrap-Up

| [← Reusable Workflows][walkthrough-previous] | [Next: GitHub Actions section overview →][walkthrough-next] |
|:-----------------------------------|------------------------------------------:|

Building a CI/CD pipeline is only half the battle — you also need to enforce it. Repository rulesets ensure that code can't be merged without passing checks and, on a collaborative repository, required reviews. Required workflows go further, allowing organizations to mandate specific workflows across all repositories. In this final exercise, you'll configure a ruleset on `main`, explore required workflows, and wrap up the workshop.

## Scenario

The shelter's CI/CD pipeline is comprehensive, but nothing currently prevents someone from merging code without passing CI — meaning untested code could reach `main` and trigger a deployment. The organization also wants to ensure all repositories run security scanning. Let's lock things down with a solo-safe ruleset and explore how required workflows enforce standards at scale.

## Background

### Repository rulesets

[Rulesets][about-rulesets] are GitHub's recommended approach for enforcing rules on branches and tags. They offer flexibility and visibility that legacy branch protection rules don't:

- **Layering** — Multiple rulesets can apply to the same branch; the most restrictive rule wins.
- **Status management** — Toggle between **Active** and **Disabled** without losing configuration.
- **Visibility** — Anyone with read access can see active rulesets (not just admins).
- **Bypass permissions** — Granular bypass for specific roles, teams, or GitHub Apps.
- **Scope** — Repository-level or organization-wide (on GitHub Enterprise).
- **Required workflows** — Rulesets can require specific workflows to pass before merging.

Rulesets are available on all GitHub plans for public repositories, and on GitHub Pro, Team, and Enterprise plans for private repositories.

### Required workflows

One of the most powerful ruleset features is the ability to **require specific workflows to pass before merging**. This is particularly useful at the organization level:

- An organization creates a reusable workflow (e.g. `security-scan.yml`) in a central repository.
- An organization-wide ruleset requires that workflow for all (or a subset of) repositories.
- Every PR across those repositories now runs the required workflow automatically — individual repository owners can't skip it.

Common use cases include security scanning, license compliance, and code quality checks.

## Add a summary job to the CI workflow

Right now we have two sets of tests - end to end tests with Playwright, and unit tests with Python. The latter is actually setup using a matrix, where we run the tests against different versions of Python. As time goes on, the list of tests may grow and change. We want to ensure we can easily indicate that **all** tests have passed in one, centralized report. This will allow us to then use this as our flag when creating a gate, to ensure our CI has completed successfully before allowing a merge into `main`. We'll do this by adding a new job to the end of our tests workflow, which will check if all jobs in the workflow have succeeded.

1. Open `.github/workflows/run-tests.yml` and add the following job at the end of the `jobs:` section (after the `test-e2e` job):

    ```yaml
      tests-passed:
        if: always()
        needs: [test-api, test-e2e]
        runs-on: ubuntu-latest
        steps:
          - name: Check results
            run: |
              if [[ "${{ needs.test-api.result }}" != "success" || "${{ needs.test-e2e.result }}" != "success" ]]; then
                echo "One or more jobs failed"
                exit 1
              fi
    ```

2. Use your editor's **Source Control** view to commit and push the workflow change, or use these optional terminal commands:

    ```bash
    git add .github/workflows/run-tests.yml
    git commit -m "Add tests-passed summary job"
    git push
    ```

The `if: always()` ensures this job runs even when upstream jobs fail, so it can correctly report failure. The `needs` key creates a dependency on both test jobs, and the step checks their results.

## Create a ruleset for `main`

Let's create a ruleset that requires our tests to pass and changes to arrive through pull requests before merging to `main`. A solo repository owner cannot approve their own pull request, so the attendee path uses zero required approvals.

1. Navigate to your repository on GitHub.
2. Select **Settings**, then in the left sidebar under **Code and automation**, expand **Rules** and select **Rulesets**.
3. Select **New ruleset** > **New branch ruleset**.
4. Under **Ruleset name**, enter `main-gate`.
5. Set the **Enforcement status** to **Active**.
6. Under **Target branches**, select **Add target** > **Include default branch**. This targets `main`.
7. Under **Branch rules**, enable the following rules:

    | Rule | Configuration |
    |------|--------------|
    | **Require a pull request before merging** | Set **Required approvals** to `0` |
    | **Require status checks to pass** | Check **Require branches to be up to date before merging**, then add `tests-passed` as a required check |
    | **Block force pushes** | *(enabled by default)* |

8. Select **Create** to save the ruleset.

> [!TIP]
> If your status checks don't appear when searching, make sure the CI workflow has run at least once on the repository. GitHub only shows status checks that have been reported previously.

> [!NOTE]
> You can start a ruleset in **Disabled** mode to test it before enforcing. This lets you preview which PRs would be blocked without actually blocking anyone.

> [!TIP]
> If you are paired with a collaborator who has write access, set **Required approvals** to `1` and have your partner review the test pull request. Solo attendees should keep it at `0`; otherwise they will lock themselves out of merging.

## Test the ruleset

Let's verify the ruleset is working.

1. Create a branch named `test-ruleset` using your editor's branch picker, edit `app/server/app.py`, and add `# test change` on a new line. Commit and publish the branch from **Source Control**.

   You can also do the entire step on GitHub: use the branch selector to create `test-ruleset`, open `app/server/app.py`, select the pencil icon, add the comment, and select **Commit changes** on the new branch.

   If you have a terminal, the equivalent commands are:

    ```bash
    git checkout -b test-ruleset
    echo "# test change" >> app/server/app.py
    git add app/server/app.py
    git commit -m "Test ruleset enforcement"
    git push -u origin test-ruleset
    ```

2. Navigate to your repository on GitHub and create a pull request from `test-ruleset` to `main`.
3. Observe that the **Merge pull request** button is disabled while the required status checks are pending.
4. Watch the CI workflow run. After all checks pass, the merge button becomes available. If you chose the collaborator alternative with one required approval, it remains disabled until your partner approves.
5. You can close the pull request — the important thing is that the ruleset is enforced!

> [!IMPORTANT]
> Rulesets ensure your CI pipeline isn't just a suggestion — it's a requirement. Code cannot reach `main` without passing the checks and reviews you've defined. Since your deploy workflow only triggers on pushes to `main`, this means only validated, reviewed code gets deployed.

## Organizational required workflows

Organization-wide rulesets can mandate that specific workflows run across all repositories. This pairs naturally with the reusable workflows you built in the [previous exercise](08-reusable-workflows.md) — an organization could create a reusable security-scanning workflow in a central `.github` repository, then enforce it via a ruleset so every PR across the organization runs it automatically.

> [!NOTE]
> Organization-wide rulesets are available on GitHub Team and GitHub Enterprise plans. For personal repositories on the Free plan, repository-level rulesets (as configured above) provide similar enforcement at the repo level.

## Advanced features to explore

Here are some additional GitHub Actions features you can explore on your own:

- **Service containers**: Spin up databases, caches, or other services alongside your test jobs. Define them under `services` in a job, and GitHub Actions handles the lifecycle for you.
- **Job summaries**: Write Markdown to the `$GITHUB_STEP_SUMMARY` environment file to create rich, formatted output that appears on the workflow run summary page.
- **Self-hosted runners**: Run workflows on your own infrastructure for specialized hardware needs, compliance requirements, or to stay within your network. Useful when you need GPUs, specific OS versions, or access to internal resources.
- **Larger runners**: GitHub-hosted runners with more CPU and memory (up to 96-core x64 and 64-core ARM), available on Team and Enterprise plans. Swap `runs-on: ubuntu-latest` for a larger runner label when your builds or tests need more compute. See the [larger runners documentation][larger-runners].
- **`repository_dispatch`**: Trigger workflows from external events via the GitHub API. This is useful for integrating GitHub Actions with external systems like monitoring tools, chatbots, or other CI/CD platforms.

## Wrap-up and congratulations

Congratulations! You've built a complete CI/CD pipeline for the pet shelter application. Let's review what you've accomplished:

- **Continuous integration**: Tests run on every push and pull request across multiple Python versions, catching bugs before they reach `main`.
- **Continuous deployment**: Automated deployment to Azure via `azd`, triggered after CI passes on `main`.
- **Custom actions**: Encapsulated Python setup and database seeding into a reusable composite action, eliminating duplication across jobs.
- **Reusable workflows**: Extracted the deployment pattern into a callable workflow template, shared by both the automated CD pipeline and a manual deploy workflow for rollbacks.
- **Manual deployment**: Added on-demand deployment capability for rollbacks and hotfixes, using `workflow_dispatch` with a git ref input.
- **Rulesets**: Enforced quality gates so code can't be merged without passing CI checks. Paired attendees also practiced a peer-review requirement.

This pipeline follows the same patterns used by teams across GitHub. As the shelter's application grows, this foundation will scale with it.

### Continue learning

If you want to keep exploring, here are some suggested next steps:

- Add a code scanning workflow using [GitHub Advanced Security][github-security].
- Explore [GitHub Environments][environments-docs] with deployment protection rules for staged deployments (e.g., staging → production with manual approval).
- Explore the [GitHub Actions Marketplace][actions-marketplace] for community-built actions.
- Take the [GitHub Skills: Deploy to Azure][skills-deploy-azure] course for a deeper dive into Azure deployment.

## Resources

- [About rulesets][about-rulesets]
- [Creating rulesets for a repository][creating-rulesets]
- [Available rules for rulesets][available-rules]
- [The `workflow_dispatch` event][workflow-dispatch]
- [GitHub Skills: Deploy to Azure][skills-deploy-azure]
- [GitHub Actions Marketplace][actions-marketplace]

| [← Reusable Workflows][walkthrough-previous] | [Next: GitHub Actions section overview →][walkthrough-next] |
|:-----------------------------------|------------------------------------------:|

[about-rulesets]: https://docs.github.com/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets
[actions-marketplace]: https://github.com/marketplace?type=actions
[available-rules]: https://docs.github.com/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets
[creating-rulesets]: https://docs.github.com/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/creating-rulesets-for-a-repository
[environments-docs]: https://docs.github.com/actions/managing-workflow-runs-and-deployments/managing-deployments/managing-environments-for-deployment
[github-security]: https://github.com/features/security
[larger-runners]: https://docs.github.com/actions/using-github-hosted-runners/using-larger-runners
[skills-deploy-azure]: https://github.com/skills/deploy-to-azure
[workflow-dispatch]: https://docs.github.com/actions/writing-workflows/choosing-when-your-workflow-runs/events-that-trigger-workflows#workflow_dispatch
[walkthrough-previous]: 08-reusable-workflows.md
[walkthrough-next]: README.md
