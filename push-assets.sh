#!/bin/bash
PACKAGE_VERSION="${TRAVIS_COMMIT_MESSAGE}"
git checkout --orphan assets
git reset --hard
git rm --cached -r .
git add build/sublime/LinkedData.sublime-package
git commit -m "v${PACKAGE_VERSION}"
git remote add github-asset "https://blake-regalia:${GITHUB_OAUTH_TOKEN}@github.com/blake-regalia/linked-data.syntaxes.git"
git push -f github-asset assets
