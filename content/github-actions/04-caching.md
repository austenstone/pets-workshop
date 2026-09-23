# Caching

| [← Running Tests][walkthrough-previous] | [Next: Matrix Strategies & Parallel Testing →][walkthrough-next] |
|:-----------------------------------|------------------------------------------:|

The [GitHub Actions Marketplace][actions-marketplace] is a collection of pre-built actions created by GitHub and the community. Actions can set up tools, run tests, deploy code, send notifications, and much more. Rather than writing everything from scratch, you can leverage the work of thousands of developers.

In this exercise you'll also learn about **caching** — a technique to speed up your workflows by reusing previously downloaded dependencies instead of fetching them from the internet on every run.

## Scenario

The CI workflow from the previous exercise works, but both jobs reinstall every dependency from scratch on every run. That means repeatedly downloading Python packages, npm package data, and Playwright browsers even when they haven't changed. You want to ensure workflows run as quickly as possible, to move from idea to deployed as quickly as possible.

## Background

[Caching][caching-docs] stores package-manager download data between workflow runs so it does not need to be fetched from the internet every time. Each cache is identified by a key — typically derived from the package manager and lock file. When a workflow runs, it checks for an existing cache matching that key. On a hit, the cached data is restored before the install step. On a miss, packages are downloaded normally and the cache is saved for next time.

Many popular setup actions — like `actions/setup-python` and `actions/setup-node` — have caching built right in, so you can enable it with a single line. GitHub provides 10 GB of cache storage per repository, with least-recently-used entries evicted when the limit is reached.

## Add caching to the unit test job

Many popular setup actions have caching built right in. Let's start with the `test-api` job, which uses Python. Libraries are installed with `pip`, so the workflow can reuse pip's downloaded package data between runs.

1. In your workspace, open `.github/workflows/run-tests.yml`.
2. Update the **Set up Python** step in the `test-api` job to enable pip caching:

    ```yaml
          - name: Set up Python
            uses: actions/setup-python@v7
            with:
              python-version: '3.14'
              cache: 'pip'
    ```

> [!NOTE]
> The `cache: 'pip'` option tells `setup-python` to cache pip's downloaded package data. On the first run it saves the cache; on subsequent runs it restores it, skipping most download time.

3. Save the file.

## Add caching to the e2e test job

The e2e job uses both pip and npm, so we can cache download data for each package manager. To make sure the npm cache is refreshed when package versions change, use `package-lock.json` as the cache dependency path.

1. Update the **Set up Python** step in the `test-e2e` job the same way:

    ```yaml
          - name: Set up Python
            uses: actions/setup-python@v7
            with:
              python-version: '3.14'
              cache: 'pip'
    ```

2. Update the **Set up Node.js** step in the `test-e2e` job to enable npm caching:

    ```yaml
          - name: Set up Node.js
            uses: actions/setup-node@v7
            with:
              node-version: '24'
              cache: 'npm'
              cache-dependency-path: 'app/client/package-lock.json'
    ```

    `setup-node` caches npm's global package data, not the project's `node_modules` directory. `npm ci` still recreates `node_modules` on every run, but it can reuse packages from the restored npm cache instead of downloading them again.

3. Save the file.

> [!NOTE]
> You might wonder about caching Playwright browsers too. Playwright's [official CI guidance][playwright-ci] recommends running `npx playwright install --with-deps` on every run rather than caching browsers, since browser binaries are tightly coupled to the Playwright version and caching them can lead to subtle version mismatches.

## Compare run times

Now let's push the changes and see the impact of caching.

1. Use your editor's **Source Control** view to commit and push the updated workflow, or use these optional terminal commands:

    ```bash
    git add .github/workflows/run-tests.yml
    git commit -m "Add caching to CI workflow"
    git push
    ```

2. Navigate to the **Actions** tab on GitHub and observe the workflow run.
3. Once it completes, check the logs for the setup steps. You should see output indicating a **cache miss** — this is expected on the first run since there's nothing cached yet.
4. To see caching in action, trigger a second run. You can push a small change (such as adding a comment to `run-tests.yml`) or use the GitHub UI:
   - Update the `on` section to add `workflow_dispatch:` so you can trigger runs manually
   - Push that change, then use the **Run workflow** button on the **Actions** tab

5. On the second run, check the setup step logs again. You should see a **cache hit**, and the overall run time should be noticeably shorter.

> [!TIP]
> You can view cache usage for your repository by navigating to **Actions** > **Caches** in the left sidebar. This shows all active caches, their sizes, and when they were last used.

## Summary and next steps

The Actions Marketplace provides thousands of pre-built actions so you don't have to reinvent the wheel. Many setup actions like `setup-python` and `setup-node` have caching built in, making it easy to reduce workflow run times by reusing package-manager download data.

Next, we'll explore [matrix strategies][walkthrough-next] to test across multiple configurations simultaneously.

## Resources

- [GitHub Actions Marketplace][actions-marketplace]
- [Caching dependencies to speed up workflows][caching-docs]
- [Playwright CI documentation][playwright-ci]
- [actions/setup-python][setup-python-action]
- [actions/setup-node][setup-node]

| [← Running Tests][walkthrough-previous] | [Next: Matrix Strategies & Parallel Testing →][walkthrough-next] |
|:-----------------------------------|------------------------------------------:|

[actions-marketplace]: https://github.com/marketplace?type=actions
[caching-docs]: https://docs.github.com/actions/writing-workflows/choosing-what-your-workflow-does/caching-dependencies-to-speed-up-workflows
[marketplace]: https://github.com/marketplace
[playwright-ci]: https://playwright.dev/docs/ci
[setup-node]: https://github.com/actions/setup-node
[setup-python-action]: https://github.com/actions/setup-python
[walkthrough-previous]: 03-running-tests.md
[walkthrough-next]: 05-matrix-strategies.md
