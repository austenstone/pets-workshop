# Matrix Strategies & Parallel Testing

| [← Caching][walkthrough-previous] | [Next: Deploying to Azure with azd →][walkthrough-next] |
|:-----------------------------------|------------------------------------------:|

Matrix strategies let you run a job across multiple configurations in parallel — different language versions, operating systems, or test targets. This is powerful for ensuring compatibility and catching environment-specific bugs early in the development cycle.

## Scenario

While the goal is to deploy the project to Azure, in the future you may look to host the app on other platforms. As part of the testing, you want to ensure the Python code will run correctly on different versions of the language runtime. This will avoid future surprises.

## Background

A [matrix][matrix-docs] allows you to create an array for a workflow to iterate through. This can be various configurations, operating systems, or anything else where you need to have a part of a workflow run multiple times. You define the values for the matrix in an array, then utilize the `matrix` keyword to retrieve the current value. GitHub Actions will handle the looping automatically for you!

## Add a matrix to the test job

Let's update the CI workflow to test the API across multiple Python versions.

1. Open `.github/workflows/run-tests.yml` in your workspace.
2. Locate the `test-api` job.
3. Add a `strategy` block with a `matrix` definition, and update the `python-version` input to reference the matrix value.
4. Replace the existing `test-api` job with the following:

    ```yaml
    test-api:
      runs-on: ubuntu-latest
      strategy:
        matrix:
          python-version: ['3.12', '3.13', '3.14']

      steps:
        - uses: actions/checkout@v7

        - name: Set up Python ${{ matrix.python-version }}
          uses: actions/setup-python@v7
          with:
            python-version: ${{ matrix.python-version }}
            cache: 'pip'

        - name: Install dependencies
          run: |
            python -m pip install --upgrade pip
            pip install -r app/server/requirements.txt

        - name: Run tests
          working-directory: ./app/server
          run: |
            python -m unittest test_app -v
    ```

> [!IMPORTANT]
> Make sure to quote version numbers like `'3.12'` in the matrix array. Without quotes, YAML may interpret them as floating-point numbers — for example, `3.10` becomes `3.1`, which would cause the setup step to fail.

5. Use your editor's **Source Control** view to commit and push the updated workflow, or use these optional terminal commands:

    ```bash
    git add .github/workflows/run-tests.yml
    git commit -m "Add Python version matrix to test-api job"
    git push
    ```

6. Navigate to the **Actions** tab on GitHub. You should see four jobs total: three parallel `test-api` matrix jobs — one for each Python version — plus the existing `test-e2e` job.

## Understanding matrix behavior

By default, GitHub Actions uses **fail-fast** mode: if any matrix job fails, all remaining jobs are cancelled. This is efficient but can hide failures in other configurations.

- **`fail-fast: false`** — continues running all matrix jobs even if one fails. This is valuable when you want to see the full picture of which configurations pass and which don't.
- **`max-parallel`** — limits the number of jobs running concurrently. Useful when you have resource constraints or are hitting rate limits.

Update the strategy block to disable fail-fast:

```yaml
strategy:
  fail-fast: false
  matrix:
    python-version: ['3.12', '3.13', '3.14']
```

> [!TIP]
> Setting `fail-fast: false` is particularly useful during initial setup or when debugging, as it provides a complete view of compatibility across all configurations.

## Using include and exclude

Matrix strategies support `include` and `exclude` to fine-tune which combinations run.

- **`include`** adds extra combinations or additional variables to existing combinations.
- **`exclude`** removes specific combinations from the matrix.

Here's an example that adds an extra combination with an additional environment variable, and excludes a specific one:

```yaml
strategy:
  fail-fast: false
  matrix:
    python-version: ['3.12', '3.13', '3.14']
    os: [ubuntu-latest, ubuntu-22.04]
    exclude:
      - python-version: '3.14'
        os: ubuntu-22.04
    include:
      - python-version: '3.14'
        os: ubuntu-latest
        experimental: true
```

In this example:

- The `exclude` block skips Python 3.14 on `ubuntu-22.04`.
- The `include` block adds an `experimental` flag to the Python 3.14 / `ubuntu-latest` combination, which you could reference with `${{ matrix.experimental }}` in your steps.

> [!NOTE]
> You don't need to add this to your workflow right now. This is provided as a reference for more advanced matrix configurations.

## Summary and next steps

Matrix strategies let you test across multiple configurations — language versions, operating systems, and more — with minimal YAML duplication. Combined with `fail-fast`, `max-parallel`, `include`, and `exclude`, you have fine-grained control over parallel testing. Next we'll [deploy to Azure using azd][walkthrough-next].

## Resources

- [Using a matrix for your jobs][matrix-docs]
- [Workflow syntax for `jobs.<job_id>.strategy`][strategy-syntax]

| [← Caching][walkthrough-previous] | [Next: Deploying to Azure with azd →][walkthrough-next] |
|:-----------------------------------|------------------------------------------:|

[matrix-docs]: https://docs.github.com/actions/using-jobs/using-a-matrix-for-your-jobs
[strategy-syntax]: https://docs.github.com/actions/using-workflows/workflow-syntax-for-github-actions#jobsjob_idstrategy
[walkthrough-previous]: 04-caching.md
[walkthrough-next]: 06-deploy-azure.md
