# Optional Bonus 12: Concurrency and Cancellation

| [← Deployment Gates][walkthrough-previous] | [Next bonus: Pages Preview →][walkthrough-next] |
|:-----------------------------------|------------------------------------------:|

> [!IMPORTANT]
> This is an independently skippable bonus round. It is not part of the 120-minute core workshop.

Run the same workflow multiple times and compare two policies:

- Cancel stale preview work when a newer run arrives.
- Retain production deployments and process them one at a time.

## At a glance

| Item | Details |
|---|---|
| Recommended duration | 10 minutes |
| Short / extended options | 5-minute explanation / 15-minute cancel-versus-queue comparison |
| Delivery | Hands-on |
| Prerequisites | Actions enabled; workflow on the default branch |
| Repository settings | None |
| Reset | Cancel waiting runs and delete the copied workflow |

Concurrency groups are repository-scoped and case-insensitive. Include `${{ github.workflow }}` in a group unless cross-workflow exclusion is intentional.

## Prepared workflow

Create `.github/workflows/concurrency-lab.yml` with:

```yaml
name: Bonus - Concurrency Lab
run-name: Concurrency lab - ${{ inputs.behavior }}

on:
  workflow_dispatch:
    inputs:
      behavior:
        description: Concurrency behavior to demonstrate
        required: true
        type: choice
        options:
          - Cancel stale preview
          - Queue production deployments
      hold-seconds:
        description: Keep the job running long enough to trigger another run
        required: true
        default: '60'
        type: choice
        options:
          - '20'
          - '60'

permissions: {}

jobs:
  cancel-stale-preview:
    if: inputs.behavior == 'Cancel stale preview'
    runs-on: ubuntu-slim
    concurrency:
      group: ${{ github.workflow }}-preview
      cancel-in-progress: true
    steps:
      - name: Hold preview slot
        env:
          HOLD_SECONDS: ${{ inputs.hold-seconds }}
        run: |
          {
            echo '## Cancel stale preview'
            echo
            echo "- Run: \`${GITHUB_RUN_ID}\`"
            echo "- Group: \`${GITHUB_WORKFLOW}-preview\`"
            echo '- Policy: cancel the running job when a newer run arrives'
          } >> "$GITHUB_STEP_SUMMARY"
          sleep "$HOLD_SECONDS"

  queue-production-deployment:
    if: inputs.behavior == 'Queue production deployments'
    runs-on: ubuntu-slim
    concurrency:
      group: ${{ github.workflow }}-production
      queue: max
    steps:
      - name: Hold production slot
        env:
          HOLD_SECONDS: ${{ inputs.hold-seconds }}
        run: |
          {
            echo '## Queue production deployments'
            echo
            echo "- Run: \`${GITHUB_RUN_ID}\`"
            echo "- Group: \`${GITHUB_WORKFLOW}-production\`"
            echo '- Policy: retain pending runs and deploy one at a time'
          } >> "$GITHUB_STEP_SUMMARY"
          sleep "$HOLD_SECONDS"
```

Cancel stale work:

```yaml
concurrency:
  group: ${{ github.workflow }}-preview
  cancel-in-progress: true
```

Retain serialized production work:

```yaml
concurrency:
  group: ${{ github.workflow }}-production
  queue: max
```

`queue: max` allows up to 100 pending jobs or runs in one group. It cannot be combined with `cancel-in-progress: true`.

## Five-minute option: explain the choice

- CI and previews usually cancel stale work because only the newest commit matters.
- Production mutations usually should not cancel while running.
- Default single-pending behavior replaces an older pending run when another arrives.
- `queue: max` retains queued deployments when each one must execute.

Do not trigger the lab in the five-minute option.

## Ten-minute option: cancel stale work

1. Run **Bonus - Concurrency Lab** with **Cancel stale preview** and a 60-second hold.
2. Wait for the first run to enter the holding step.
3. Trigger the same option again.
4. Show the first run become **Canceled** and the second continue.
5. Open the summary to show the group and policy.

## Fifteen-minute option: compare retained queues

Complete the cancellation option, then:

1. Run **Queue production deployments** with a 60-second hold.
2. Trigger it two more times.
3. Show one run executing and the others pending.
4. Let the first finish or cancel it manually, then show the next begin.
5. Compare the outcomes: cancellation preserved only current work; the queue preserved every deployment.

Queued items are first-in-first-out based on when they begin waiting for the group. Dispatch order is not guaranteed.

## Setup and fallback

- Put the workflow on the default branch so **Run workflow** is available.
- Keep the hold at 60 seconds and the Actions run list open in another tab.
- If the room cannot trigger enough runs, use screenshots or a prepared repository showing one canceled run and multiple pending queue entries.

## Reset

- Cancel all waiting or sleeping lab runs.
- Delete `.github/workflows/concurrency-lab.yml` if the bonus should not remain.
- No repository settings or external resources are created.

## Failure modes

| Symptom | Cause | Recovery |
|---|---|---|
| Runs execute together | Group strings differ | Use one stable group per protected resource. |
| Unrelated workflow is canceled | Workflows share a repository-scoped group | Prefix with `${{ github.workflow }}` or choose an intentional shared-resource name. |
| Older pending run disappears | Default single-pending policy replaced it | Use `queue: max` when every queued run must remain. |
| Workflow validation fails | Queue retention and cancellation are combined | Choose one policy; they are mutually exclusive. |
| Runs appear out of dispatch order | Jobs reached the group at different times | Do not rely on dispatch time for ordering. |

## Validation status

The workflow parses and passes `zizmor`. GitHub supports `queue: max`; locally installed `actionlint` 1.7.12 predates that key, so validation suppresses only its documented schema error. A real hosted run remains facilitator preflight.

## References

- [Control workflow concurrency](https://docs.github.com/actions/how-tos/write-workflows/choose-when-workflows-run/control-workflow-concurrency)
- [Concurrency groups allow larger queues](https://github.blog/changelog/2026-05-07-github-actions-concurrency-groups-now-allow-larger-queues/)
- [Workflow syntax: concurrency](https://docs.github.com/actions/reference/workflows-and-actions/workflow-syntax#concurrency)

| [← Deployment Gates][walkthrough-previous] | [Next bonus: Pages Preview →][walkthrough-next] |
|:-----------------------------------|------------------------------------------:|

[walkthrough-next]: ./13-github-pages-preview.md
[walkthrough-previous]: ./11-environments-and-deployment-gates.md
