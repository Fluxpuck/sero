# FLUXPUCK'S GIT GUIDE

> This document will explain the usage of [Github Desktop](https://desktop.github.com/) in the project to help structure changes into their respective branches.

### 1. Github Desktop
Github Desktop is a client application for version control of the project. It helps to visualize the project structure by making it easier to change branches, switch versions, merging changes and update the code.

*Download link: https://desktop.github.com/*

### 2. Use of branches
The project

Push changes to a respectable branch to isolate the changes you make. This will make collaboration easier, allows for changes without affecting the main codebase, and provide a way to easily rollback changes if something goes wrong.

As for naming those branches, it is important to choose descriptive and meaningful names that reflect the changes or features you're working on.[^1]

Some common [naming conventions](https://dev.to/varbsan/a-simplified-convention-for-naming-branches-and-commits-in-git-il4) include:
- Feature branches: feature/new-feature
- Bug fix branches: bugfix/issue
- Release branches: release/version-number

### 3. Commit & Push 
Before committing, always make a fetch request, to have the latest code included in your commit. This should prevent commits to be behind the main.

Adding a commit message is essential to maintaining a clear and organized commit history. A message should include a short summary of the changes. [^2] 

Its good practise to regularly push the code to your branch. Advisable after each iteration or function written. This will help with backtracking code if needed.

### 4. Merging code
Once the task/feature is completed, all commits can be tied together by making a merge request. This will merge the branch you worked on with the main (development) branch.

Make sure a comprehensive title is added to the request. This title should summerize the entire task/feature in one sentence. Furthermore, for the describtion, try to summerize all the changes that were made. Making a list to do so is a good practise. People need to be able to understand what the merge request is for an what has been changed.



<br>
<br>

*This guide was originally created on a beautiful sunday night in february by @Fluxpuck.*

<br>

[^1]: It is possible to switch branches.
[^2]: In addition you can include a reference to a related issue(s) or task(s) to help tie the commit back to a specific item.