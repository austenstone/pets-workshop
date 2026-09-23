# Optional Bonus 10: Artifact Attestations and Provenance

| [← Core workshop overview][walkthrough-previous] | [Next bonus: Deployment Gates →][walkthrough-next] |
|:-----------------------------------|------------------------------------------:|

> [!IMPORTANT]
> This is an independently skippable bonus round. It is not part of the 120-minute core workshop.

Build the Tailspin Shelter client, package it, generate signed provenance, and verify that the downloaded bytes came from this repository and workflow.

## At a glance

| Item | Details |
|---|---|
| Recommended duration | 10 minutes |
| Short / extended options | 5-minute facilitator proof / 15-minute attendee tamper test |
| Delivery | Hands-on in a public attendee repository; facilitator fallback from a prepared successful run |
| Prerequisites | Actions enabled; workflow on the default branch; current authenticated GitHub CLI for local verification |
| Repository settings | None |
| Reset | Delete the copied workflow and any disposable run or artifact |

Artifact attestations are available for public repositories on all current GitHub plans. Private and internal repositories require GitHub Enterprise Cloud. Artifact attestations are not supported on GitHub Enterprise Server.

The attestation provides SLSA v1.0 Build Level 2 provenance. It proves where and how the artifact was built, not that the source or artifact is safe.

## Prepared workflow

Copy [`snippets/10-attest-tailspin-build.yml`](./snippets/10-attest-tailspin-build.yml) to `.github/workflows/attest-tailspin-build.yml`.

The workflow:

1. Builds the Astro client with Node.js 24.
2. Packages `app/client/dist` as `tailspin-client.tgz`.
3. Uploads the package as a workflow artifact.
4. Uses `actions/attest` to sign the package digest with a short-lived Sigstore certificate.
5. Adds the attestation and verification instructions to the run summary.

The job explicitly grants only:

```yaml
permissions:
  contents: read
  id-token: write
  attestations: write
```

`id-token: write` lets the attestation action request the short-lived identity token used for signing. It does not grant repository or cloud write access.

## Five-minute option: facilitator proof

1. Open a prepared successful **Bonus - Attest Tailspin Build** run.
2. Show the `tailspin-client` workflow artifact.
3. Open the attestation URL from the job summary.
4. Show the repository, workflow, commit, event, and runner claims.
5. Verify a previously downloaded artifact.

## Ten-minute option: attendee hands-on

1. Add the prepared workflow to the attendee's public repository.
2. Commit it to the default branch so **Run workflow** appears.
3. Run **Bonus - Attest Tailspin Build**.
4. Download and extract the workflow artifact ZIP.
5. Verify the packaged build:

   ```bash
   gh attestation verify tailspin-client.tgz -R OWNER/REPOSITORY
   ```

The visible finish is a successful verification result tied to the exact source repository and workflow.

## Fifteen-minute option: tamper test

Complete the ten-minute option, then change one byte:

```bash
cp tailspin-client.tgz tampered-tailspin-client.tgz
printf 'tampered\n' >> tampered-tailspin-client.tgz
gh attestation verify tampered-tailspin-client.tgz -R OWNER/REPOSITORY
```

The second verification must fail because the subject digest changed.

## Setup and fallback

- Use a public repository with Actions enabled.
- Confirm the workflow exists on the default branch.
- Install and authenticate a current GitHub CLI for command-line verification.
- Keep one successful run and its extracted artifact ready. If attendee runs are delayed, switch to that prepared evidence.

## Reset

- Delete `.github/workflows/attest-tailspin-build.yml` if the bonus should not remain.
- Delete disposable workflow runs or artifacts when cleanup is required.
- Attestations have their own lifecycle. Deleting a workflow run or artifact is not a substitute for deleting an attestation.

## Failure modes

| Symptom | Cause | Recovery |
|---|---|---|
| `Resource not accessible by integration` | `attestations: write` is missing or unavailable | Confirm job permissions and run from a trusted branch, not an untrusted fork pull request. |
| Identity token error | `id-token: write` is missing | Add the permission at the job or workflow level. |
| No files matched | Build failure or incorrect `subject-path` | Confirm `tailspin-client.tgz` exists before the attestation step. |
| **Run workflow** is missing | Workflow is not on the default branch | Add it to the default branch or use the prepared run. |
| Verification finds no attestation | Wrong repository, wrong file, or changed bytes | Use the producing repository and unmodified extracted package. |

## Validation status

The workflow passes local YAML and `actionlint` validation. `zizmor` is clean except for the workshop's documented use of readable current major tags. A real GitHub-hosted attestation run remains a facilitator preflight step.

## References

- [Artifact attestations](https://docs.github.com/actions/concepts/security/artifact-attestations)
- [Using artifact attestations](https://docs.github.com/actions/how-tos/secure-your-work/use-artifact-attestations/use-artifact-attestations)
- [`actions/attest`](https://github.com/actions/attest)
- [`gh attestation verify`](https://cli.github.com/manual/gh_attestation_verify)

| [← Core workshop overview][walkthrough-previous] | [Next bonus: Deployment Gates →][walkthrough-next] |
|:-----------------------------------|------------------------------------------:|

[walkthrough-next]: ./11-environments-and-deployment-gates.md
[walkthrough-previous]: ./README.md
