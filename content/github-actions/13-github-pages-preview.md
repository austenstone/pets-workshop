# Optional Bonus 13: GitHub Pages Static Preview

| [← Concurrency][walkthrough-previous] | [Back to workshop overview →][walkthrough-next] |
|:-----------------------------------|------------------------------------------:|

> [!IMPORTANT]
> This is an independently skippable bonus round. It is not part of the 120-minute core workshop. Use the attendee repository's free Pages slot. **Never run this deployment in `austenstone/pets-workshop`**, whose Pages site must remain the guide published from `main:/docs`.

Publish a clearly labeled serverless Tailspin Shelter preview. The workflow exports the committed SQLite dogs and breeds to JSON, prerenders Astro pages, and deploys static HTML beneath the attendee repository's project path.

This is a preview, not the full Flask and SQLite application. Module 06 remains the full-stack Azure deployment path.

## At a glance

| Item | Details |
|---|---|
| Recommended duration | About 10 minutes |
| Short / extended options | 5-minute facilitator tour / 15-minute attendee deployment plus route inspection |
| Delivery | Hands-on after facilitator remote preflight |
| Prerequisites | Personal public repository; Actions enabled; workflow on the default branch |
| Repository settings | Repository owner selects **GitHub Actions** as the Pages source |
| External resources | The attendee repository's one GitHub Pages site; no secrets or cloud account |
| Reset | Delete workflow, disable the Pages site, and delete the disposable environment/runs |

GitHub Pages supports public repositories on GitHub Free and paid plans. The published site is public.

## Architecture

- `app/client/scripts/export-pages-data.py` reads the committed `app/server/dogshelter.db` using Python's standard library.
- The exporter writes ignored `app/client/src-preview/data/dogs.json`.
- `app/client/astro.pages.config.mjs` enables static output and consumes the real Pages origin and base path.
- `app/client/src-preview/` prerenders the homepage, About page, and every `/dog/<id>/` route.
- Shared assets and navigation use `import.meta.env.BASE_URL`.
- No Flask process, SQLAlchemy installation, API, cloud credential, secret, or network data source is required.

## Prepared workflow

Create `.github/workflows/pages-preview.yml` with:

```yaml
name: Bonus - Tailspin Pages Preview

on:
  workflow_dispatch:

permissions: {}

concurrency:
  group: pages-preview
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pages: read
    steps:
      - name: Check out repository
        uses: actions/checkout@v7
        with:
          persist-credentials: false

      - name: Set up Node.js
        uses: actions/setup-node@v7
        with:
          node-version: '24'

      - name: Set up Python
        uses: actions/setup-python@v7
        with:
          python-version: '3.14'

      - name: Configure GitHub Pages
        id: pages
        uses: actions/configure-pages@v6

      - name: Export SQLite snapshot
        working-directory: app/client
        run: python3 scripts/export-pages-data.py

      - name: Install dependencies
        working-directory: app/client
        run: npm ci

      - name: Build static preview
        working-directory: app/client
        env:
          PAGES_SITE: ${{ steps.pages.outputs.origin }}
          PAGES_BASE_PATH: ${{ steps.pages.outputs.base_path }}
        run: npm run build:pages

      - name: Upload Pages artifact
        uses: actions/upload-pages-artifact@v5
        with:
          path: app/client/dist-pages

  deploy:
    needs: build
    runs-on: ubuntu-slim
    permissions:
      pages: write
      id-token: write
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy static preview
        id: deployment
        uses: actions/deploy-pages@v5
```

The build job has only:

```yaml
permissions:
  contents: read
  pages: read
```

The deployment job has only:

```yaml
permissions:
  pages: write
  id-token: write
```

## Five-minute option: facilitator tour

1. Open the preflight repository's successful workflow and deployment.
2. Show the exported-record count and static build.
3. Open the live project-site URL.
4. Navigate to About and a dog page, then open the dog deep link directly.
5. Point out the **Static workshop preview** notice.

## Ten-minute option: attendee deployment

1. Add the prepared workflow to the attendee repository's default branch.
2. Open **Settings** > **Pages**.
3. Set **Source** to **GitHub Actions**.
4. Run **Bonus - Tailspin Pages Preview**.
5. Open the deployment URL.
6. Verify Home, About, a dog card, **Back to All Dogs**, styling, and the favicon.
7. Confirm the URL remains under `https://OWNER.github.io/REPOSITORY/`.

## Fifteen-minute option: inspect the snapshot

Complete the deployment, then:

1. Open the exporter and compare its query with the committed SQLite data.
2. Inspect the build log's exported count.
3. Open `/REPOSITORY/dog/1/` directly in a fresh tab.
4. Explain why `getStaticPaths()`, the repository base path, and trailing-slash directories make deep links reliable.

## Source repository collision

GitHub Pages permits one site per repository. The source repository's slot is already the live attendee guide published from `main:/docs`.

- Do not select **GitHub Actions** as the Pages source in `austenstone/pets-workshop`.
- Do not run the preview workflow there.
- Use an attendee repository or a clearly disposable public template-created repository.

## Setup and fallback

- The attendee must own the repository or have admin access to configure Pages.
- Add the workflow to the default branch before looking for **Run workflow**.
- Keep a preflight repository's run and URL available. If Pages provisioning is delayed, tour that deployment instead.
- If settings are unavailable, build locally with the commands below and inspect `dist-pages`.

```bash
cd app/client
python3 scripts/export-pages-data.py
PAGES_SITE=http://127.0.0.1:4173 \
PAGES_BASE_PATH=/pets-workshop \
npm run build:pages
```

## Reset

1. Delete `.github/workflows/pages-preview.yml`.
2. Under **Settings** > **Pages**, disable the site or change the source to **None**.
3. Delete the `github-pages` environment if it exists only for this preview.
4. Delete disposable workflow runs or artifacts if desired.

Generated JSON and `dist-pages` are ignored and can be removed locally.

## Failure modes

| Symptom | Cause | Recovery |
|---|---|---|
| `Get Pages site failed` | Pages source is not **GitHub Actions** | Configure the attendee repository's Pages source before rerunning. |
| Page has no styles | Base path or asset URLs omit the repository name | Confirm `configure-pages` origin and base path reach the Astro build. |
| Navigation returns to `OWNER.github.io/` | Root-relative link bypasses `BASE_URL` | Use the shared base-aware links and rebuild. |
| Dog detail returns 404 | Static route was not generated | Confirm export precedes build and `dog/<id>/index.html` exists. |
| Preview data is stale | Site is a build-time snapshot | Rerun after changing the committed SQLite database. |
| Source guide is replaced | Workflow ran in the source repository | Restore `main:/docs`; repeat only in a disposable or attendee repository. |

## Validation status

Local validation covers the exporter, authentic record count, normal Astro server build, root and project-path static builds, generated routes/assets, deep links, and the existing Playwright suite. Facilitator preflight must additionally prove the exact workflow and live URL in a disposable public template-created repository, then delete that repository.

## References

- [What is GitHub Pages?](https://docs.github.com/pages/getting-started-with-github-pages/what-is-github-pages)
- [Configuring a Pages publishing source](https://docs.github.com/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
- [Using custom workflows with GitHub Pages](https://docs.github.com/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [Deploy an Astro site to GitHub Pages](https://docs.astro.build/en/guides/deploy/github/)

| [← Concurrency][walkthrough-previous] | [Back to workshop overview →][walkthrough-next] |
|:-----------------------------------|------------------------------------------:|

[walkthrough-next]: ./README.md
[walkthrough-previous]: ./12-concurrency-and-cancellation.md
