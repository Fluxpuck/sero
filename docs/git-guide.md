# FLUXPUCK'S GIT GUIDE

> This document will explain the usage of [Github Desktop](https://desktop.github.com/) in the project to help structure changes into their respective branches.

### 1. Github Desktop
Github Desktop is a client application for version control of the project. It helps to visualize the project structure, making it easier to switch versions, merging changes and update the code.

*Download link: https://desktop.github.com/*

### 2. Main Project
The project is structured as follows:

```yaml
Main repo
├─ .github/
│   └─ workflows/
│       └─ (CI/CD workflow files)
│
├─ docs/
│   └─ (documentation files)
│
└─ packages/
    ├─ api/
    │   └─ (Restful API files)
    │
    └─ bot/
        └─ (chatbot files)
```
### 3. Use of branches
Push changes to a respectable branch to isolate the changes you make. This will make collaboration easier, allows for changes without affecting the main codebase, and provide a way to easily rollback changes if something goes wrong.

As for naming those branches, it is important to choose descriptive and meaningful names that reflect the changes or features you're working on.[^1]

Some common [naming conventions](https://dev.to/varbsan/a-simplified-convention-for-naming-branches-and-commits-in-git-il4) include:
- Feature branches: feature/new-feature
- Bug fix branches: bugfix/fix-bug
- Release branches: release/version-number
- Hotfix branches: hotfix/fix-issue

### 4. Commit message
Before creating a commit, please fetch from the development branch to have the latest code included in your commit. This way will prevent commits that are behind the main.

Writing a commit message is essential to mainting a clear aand organized commit history. A message should start with a very short summary of the changes made in the commit, followed by any necessary context or details. It is recommended to use imperative mood and maintain a consistant style and format.[^2] 

### 5. Push your code
...

### 5. Merging code
...

<br>
<br>

*This guide was originally created on a beautiful sunday night in february by @Fluxpuck.*

<br>

[^1]: It is possible to switch branches.
[^2]: In addition you can include a reference to the related issues or tasks to help tie the commit back to a specific item.