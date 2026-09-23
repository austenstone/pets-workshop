# Workshop Setup

| [← GitHub Actions: From CI to CD][walkthrough-previous] | [Next: Introduction & Your First Workflow →][walkthrough-next] |
|:-----------------------------------|------------------------------------------:|

To complete this workshop you will need to create a repository with a copy of the contents of this repository. While this can be done by [forking a repository][fork-repo], the goal of a fork is to eventually merge code back into the original (or upstream) source. In our case we want a separate copy as we don't intend to merge our changes. This is accomplished through the use of a [template repository][template-repo]. Template repositories are a great way to provide starters for your organization, ensuring consistency across projects.

The repository for this workshop is configured as a template, so we can use it to create your repository.

## Create your repository

Let's create the repository you'll use for your workshop.

1. Navigate to [the repository root][repo-root]
2. Select **Use this template** > **Create a new repository**

    ![Screenshot of Use this template dropdown](../shared-images/setup-use-template.png)

3. Under **Owner**, select the name of your GitHub handle, or the owner specified by your workshop leader.
4. Under **Repository**, set the name to **pets-workshop**, or the name specified by your workshop leader.
5. Ensure **Public** is selected for the visibility, or the value indicated by your workshop leader.
6. Select **Create repository from template**.

    ![Screenshot of configured template creation dialog](../shared-images/setup-configure-repo.png)

In a few moments a new repository will be created from the template for this workshop!

## Choose your workspace

Use whichever editor works best for you:

1. **Codespaces (easiest full environment):** On the repository page, select **Code** > **Codespaces** > **Create codespace on main**. This gives you a browser-based VS Code editor and terminal with the repository already cloned.
2. **github.dev (terminal-free):** Press <kbd>.</kbd> on the repository page. Create files in the Explorer and commit or push them from the **Source Control** view.
3. **Local editor:** Select **Code**, copy the repository URL, clone it locally, and open it in VS Code or your preferred editor.

Keep the repository's **Actions** tab open in a second browser tab regardless of which editor you choose.

> [!TIP]
> Terminal commands in this guide are optional conveniences. In VS Code, Codespaces, or github.dev, use **Source Control** to stage files, enter a commit message, commit, and select **Sync Changes** or **Push**. In GitHub's web file editor, select **Commit changes** after editing.

## Summary and next steps

You've created the repository and opened your chosen workspace — you're ready to start building! Next let's [create your first workflow][walkthrough-next].

| [← GitHub Actions: From CI to CD][walkthrough-previous] | [Next: Introduction & Your First Workflow →][walkthrough-next] |
|:-----------------------------------|------------------------------------------:|

[fork-repo]: https://docs.github.com/get-started/quickstart/fork-a-repo
[template-repo]: https://docs.github.com/repositories/creating-and-managing-repositories/creating-a-template-repository
[repo-root]: ../..
[walkthrough-previous]: README.md
[walkthrough-next]: 01-introduction.md
