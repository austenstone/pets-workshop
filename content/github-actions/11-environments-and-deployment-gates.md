# Optional Bonus 11: Environments and Deployment Gates

| [← Artifact Attestations][walkthrough-previous] | [Next bonus: Concurrency →][walkthrough-next] |
|:-----------------------------------|------------------------------------------:|

> [!IMPORTANT]
> This is an independently skippable bonus round. It is not part of the 120-minute core workshop.

Promote the same Tailspin Shelter commit through `staging` and a protected `production` environment. The GitHub deployment objects, protection gate, and run summaries are the demo; no cloud deployment is required.

## At a glance

| Item | Details |
|---|---|
| Recommended duration | 10 minutes |
| Short / extended options | 5-minute wait timer / 15-minute reviewer, rejection, and branch-rule comparison |
| Delivery | Facilitator-led by default; paired hands-on when attendees can review each other |
| Prerequisites | Public repository; workflow on the default branch; eligible second reviewer for reviewer mode |
| Repository settings | Admin access to create and configure `staging` and `production` environments |
| Reset | Cancel waiting runs; remove protection rules; delete disposable environments and workflow |

Environments are available for public repositories on all current GitHub plans. On Free, Pro, and Team, required reviewers and wait timers are limited to public repositories. Protection rules live in repository settings, not in workflow YAML.

## Prepared workflow

Create `.github/workflows/gated-tailspin-deployment.yml` with:

```yaml
name: Bonus - Gated Tailspin Deployment

on:
  workflow_dispatch:

permissions: {}

jobs:
  deploy-staging:
    name: Deploy to staging
    runs-on: ubuntu-slim
    environment:
      name: staging
    steps:
      - name: Record staging deployment
        run: |
          {
            echo '## Staging deployment'
            echo
            echo "- Commit: \`${GITHUB_SHA}\`"
            echo "- Actor: \`${GITHUB_ACTOR}\`"
            echo '- Result: simulated deployment completed'
          } >> "$GITHUB_STEP_SUMMARY"

  deploy-production:
    name: Deploy to production
    needs: deploy-staging
    runs-on: ubuntu-slim
    environment:
      name: production
    steps:
      - name: Record production deployment
        run: |
          {
            echo '## Production deployment'
            echo
            echo "- Commit: \`${GITHUB_SHA}\`"
            echo "- Actor: \`${GITHUB_ACTOR}\`"
            echo '- Result: protected promotion completed'
          } >> "$GITHUB_STEP_SUMMARY"
```

The workflow creates deployment records for two environments:

```yaml
environment:
  name: production
```

A protected environment job cannot start until its rules pass.

## Five-minute option: wait timer

1. Create `staging` and `production`.
2. Add a one-minute wait timer to `production`.
3. Run **Bonus - Gated Tailspin Deployment**.
4. Show `staging` complete, `production` waiting, and the job continuing after the timer.

The wait does not consume billable Actions time.

## Ten-minute option: required reviewer

Use a facilitator repository or pair attendees.

1. Create `staging` without protection rules.
2. Create `production` and add a required reviewer with read access.
3. Enable **Prevent self-review** when a second person is available.
4. Run the workflow.
5. Open the waiting job and select **Review deployments**.
6. Approve `production` with an optional comment.
7. Show the deployment history and production summary.

## Fifteen-minute option: reject and restrict

Complete the reviewer option, then:

1. Rerun and reject the production deployment to show that protected steps never execute.
2. Add a deployment branch rule for the default branch.
3. Dispatch from an allowed branch, then compare with a disallowed ref.
4. Explain that protection rules gate access to environment secrets and variables as well as job execution.

## Setup and fallback

- Configure the exact environment names before the run. A workflow can auto-create an environment, but it will be unprotected.
- For reviewer mode, make sure an eligible reviewer has repository read access.
- Keep a prepared run waiting at the production gate. If live setup fails, demonstrate approval, rejection, and deployment history there.
- Use the timer option when a second reviewer is unavailable.

## Reset

- Cancel any waiting workflow runs.
- Remove reviewers, timers, branch rules, secrets, or variables created for the demo.
- Delete disposable `staging` and `production` environments. Deleting one also removes its protection rules and fails waiting jobs.
- Delete `.github/workflows/gated-tailspin-deployment.yml` if the bonus should not remain.

## Failure modes

| Symptom | Cause | Recovery |
|---|---|---|
| Production starts immediately | Environment was auto-created without protection | Configure the exact `production` environment before rerunning. |
| Initiator cannot approve | **Prevent self-review** is enabled | Ask another configured reviewer or switch to the timer option. |
| Reviewer is missing | User or team lacks repository read access | Grant read access or choose another eligible reviewer. |
| Deployment is rejected | Reviewer selected **Reject** | Rerun and approve the new deployment. |
| Branch cannot deploy | Run ref does not match the environment rule | Dispatch from an allowed branch or correct the rule. |
| Environment value is unavailable | Job lacks the environment or approval has not passed | Put `environment` on the consuming job and pass the gate. |

## Validation status

The workflow passes local YAML, `actionlint`, and `zizmor` validation. Environment reviewer, timer, rejection, and branch-rule behavior require facilitator preflight because they are repository settings rather than branch code.

## References

- [Managing environments for deployment](https://docs.github.com/actions/how-tos/deploy/configure-and-manage-deployments/manage-environments)
- [Deployments and environments](https://docs.github.com/actions/reference/workflows-and-actions/deployments-and-environments)
- [Reviewing deployments](https://docs.github.com/actions/how-tos/deploy/configure-and-manage-deployments/review-deployments)

| [← Artifact Attestations][walkthrough-previous] | [Next bonus: Concurrency →][walkthrough-next] |
|:-----------------------------------|------------------------------------------:|

[walkthrough-next]: ./12-concurrency-and-cancellation.md
[walkthrough-previous]: ./10-artifact-attestations.md
