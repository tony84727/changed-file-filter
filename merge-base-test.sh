#!/bin/bash

testingDir=$(mktemp -d)
echo $testingDir
cd "$testingDir"
git init
git remote add origin https://github.com/tony84727/changed-file-filter
git config --local gc.auto 0
git -c protocol.version=2 fetch --no-tags --prune --progress --no-recurse-submodules --depth=1 origin +e4b536e9392899c25e7d568072f4d33569fecd27:refs/remotes/pull/9/merge
git checkout --progress --force refs/remotes/pull/9/merge

setupCommiterInfo() {
    git config --local user.name 'Github Action'
    git config --local user.email 'action@github.com'
}

addCommit() {
    mkdir testzone
    touch testzone/added_by_this_pr.txt
    git checkout -b this_pr
    git add testzone/added_by_this_pr.txt
    git commit -m "add by this PR"
}

base="d2a27193453e5ccc6da9b90765c533d3b8c842e1"

moveBase() {
    git fetch --depth=1 origin "$base"
    git checkout -b base "$base"
    mkdir testzone_1
    touch testzone_1/added_by_other_pr.txt
    git add testzone_1/added_by_other_pr.txt
    git commit -m "another merged PR"
    echo "::set-output name=base::$(git rev-parse HEAD)"
}

setupCommiterInfo
addCommit
moveBase
git checkout this_pr