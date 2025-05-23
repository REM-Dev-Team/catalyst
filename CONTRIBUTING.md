# Contributing to Catalyst

Thanks for showing interest in contributing!

The following is a set of guidelines for contributing to Catalyst. These are just guidelines, not rules. Use your best judgment, and feel free to propose changes to this document in a pull request.

## Repository Structure

Catalyst is a monorepo that contains the code for the Catalyst Next.js application inside of `core/`, and supporting packages such as the GraphQL API client and the `create-catalyst` CLI in `packages/`.

The default branch for this repository is called `canary`. This is the primary development branch where active development takes place, including the introduction of new features, bug fixes, and other changes before they are released in stable versions.

To contribute to the `canary` branch, you can create a new branch off of `canary` and submit a PR against that branch.

## Makeswift Integration

In addition to `canary`, we also maintain the `integrations/makeswift` branch, which contains additional code required to integrate with [Makeswift](https://www.makeswift.com).

To contribute to the `integrations/makeswift` branch, you can create a new branch off of `integrations/makeswift` and submit a PR against that branch.

### Pulling updates from `canary` into `integrations/makeswift`

We aim to keep `integrations/makeswift` in sync with `canary`. To do this, we pull the latest code from `canary` into `integrations/makeswift` right after we cut a new release for `canary`.

To pull the latest code from `canary` into `integrations/makeswift`, you can follow these steps:

1. Check [open Pull Requests](https://github.com/bigcommerce/catalyst/pulls?q=is%3Apr+is%3Aopen) for any PR's titled `Version Packages (main)` ([example](https://github.com/bigcommerce/catalyst/pull/1892))
   a. If you find one, it should be approved and merged before continuing
   b. If you do not find one, it most likely indicates that `canary` and `integrations/makeswift` are already in sync, and there are no updates to pull into `integrations/makeswift` from `canary`.

> [!TIP]
> The remaining steps assume you are working locally after having cloned `bigcommerce/catalyst`, and that you have rights to push to the `integrations/makeswift` branch on GitHub.

2. Fetch the latest code from `canary`:

   ```bash
   git checkout canary
   git pull
   ```

3. Fetch the latest code from `integrations/makeswift`:

   ```bash
   git checkout integrations/makeswift
   git pull
   ```

4. Checkout a new branch from `integrations/makeswift`:

   ```bash
   git checkout -b {new-branch-name}
   ```

5. Merge `canary` into the new branch:

   ```bash
   git merge canary
   ```

6. Resolve merge conflicts, if necessary.

> [!WARNING]
> Ensure that the merge does not inadvertently overwrite the `integrations/makeswift` version of `core/CHANGELOG.md`, or the `name` and `version` fields in `core/package.json`. The `name` field should remain `@bigcommerce/catalyst-makeswift`, the `version` field should remain whatever the latest published `@bigcommerce/catalyst-makeswift` version was, and the `core/CHANGELOG.md` should not include any changelog entries from the `canary` version of `core/CHANGELOG.md`

7. Create a new `.changeset/*.md` file on `integrations/makeswift` by running `pnpm changeset`. The version bump you choose (e.g., `major`, `minor`, or `patch`) should match the version bumped by the original `Version Packages (main)` PR from Step 1 above. For the Changeset description, simply link to the `core/CHANGELOG.md` entry on `canary` that was created by the `Version Packages (main)` PR from Step 1 above. Create another commit containing the Changeset file.

8. Open a new PR in GitHub to merge your new branch into `integrations/makeswift`. This PR should be code reviewed and approved before the next steps.

9. Rebase the changes onto the local `integrations/makeswift` branch in order to make the branches 1-1 and keep a linear commit history.

   ```bash
   git checkout integrations/makeswift
   git rebase {new-branch-name}
   ```

10. Push the changes up to GitHub, which will automatically close the open PR from step 6.

    ```bash
    git push
    ```

11. This should create or update a PR titled `Version Packages (integrations/makeswift)`. Approving and merging this PR will create a new GitHub release for `@bigcommerce/catalyst-makeswift` based on the version bump you chose in Step 7 above.

## Other Ways to Contribute

- Consider reporting bugs, contributing to test coverage, or helping spread the word about Catalyst.

## Git Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference pull requests and external links liberally

Thank you again for your interest in contributing to Catalyst!
