/*
  This file is work with Github API.
  It is for internal use only.

  Functions in this file starts with gh to represent GitHub.
  This will be helpful to add other version control systems in
  future, as gh can represent GitHub and gl can represent GitLab
*/
import { Octokit } from "@octokit/rest";

export const getContent = async (octo, org: string, repo: string, ref: string, fileName: string) => {
  const data = octo.repos.getContents({ owner: org, repo: repo, ref: ref, path: fileName })
  return data
}

export const listForks = async (owner: string, repo: string) => {
  // This gets the fork of the active repo
  const octo = new Octokit()
  const data = await octo.repos.listForks({ owner: owner, repo })
  return data
}

export const createFork = async (octo, owner: string, repo: string) => {
  const fork = await octo.repos.createFork({ owner, repo, })
  return fork
}

export const repoExist = async (octo, owner: string, repo: string) => {
  const bool = await octo.repos.get({ owner, repo })
  return bool
}


// ghCheckFork performs 3 checks
// A: If user is the owner of repo.
// B: If fork exists.
// C: If fork doesn't exist, create it.
export const checkFork = async (
  octo: Octokit,
  org: string,
  repo: string,
  branch: string = `master`,
  username: string
) => {

  // Step 1: Check if user is owner of the repo
  if (username == org) {
    await repoExist(octo, username, repo)
  } else {

    // Step 2: Check if user already have a fork of the repo
    await listForks(org, repo).then(({ data }) => {
      for (const repo of data) {
        if (repo.owner.login === username) {
          return
        }
      }
    })

    // Step 3: Create the fork
    await createFork(octo, org, repo)
  }

}

/*
 *
 * Save commit to github
 *
 */
export const uploadToRepo = async (
  octo: Octokit,
  org: string,
  repo: string,
  branch: string = `master`,
  buffer: {},
  commitMessage: string = `Auto commit from nteract web`,
) => {
  // Step 1: Get current commit
  const currentCommit = await getCurrentCommit(octo, org, repo, branch)

  // Step 2: Get files path and content to create blob
  let pathsForBlobs = []
  let filesContent = []
  for (var key in buffer) {
    pathsForBlobs.push(key)
    filesContent.push(buffer[key])
  }

  // Step 3: Create File Blob
  const filesBlobs = await Promise.all(filesContent.map(createBlobForFile(octo, org, repo)))

  // Step 4: Create new tree with new files
  const newTree = await createNewTree(
    octo,
    org,
    repo,
    filesBlobs,
    pathsForBlobs,
    currentCommit.treeSha
  )

  // Step 5: Create new commit
  const newCommit = await createNewCommit(
    octo,
    org,
    repo,
    commitMessage,
    newTree.sha,
    currentCommit.commitSha
  )

  // Step 6:  Push new commit to github
  await setBranchToCommit(octo, org, repo, branch, newCommit.sha)
}

export const getCurrentCommit = async (
  octo: Octokit,
  org: string,
  repo: string,
  branch: string = 'master'
) => {
  const { data: refData } = await octo.git.getRef({
    owner: org,
    repo,
    ref: `heads/${branch}`,
  })
  const commitSha = refData.object.sha
  const { data: commitData } = await octo.git.getCommit({
    owner: org,
    repo,
    commit_sha: commitSha,
  })
  return {
    commitSha,
    treeSha: commitData.tree.sha,
  }
}

export const createBlobForFile = (octo: Octokit, org: string, repo: string) => async (
  content: string
) => {
  const blobData = await octo.git.createBlob({
    owner: org,
    repo,
    content,
    encoding: 'utf-8',
  })
  return blobData.data
}

export const createNewTree = async (
  octo: Octokit,
  owner: string,
  repo: string,
  blobs,
  paths: string[],
  parentTreeSha: string
) => {
  const mode = `100644`
  const tree = blobs.map(({ sha }, index) => ({
    path: paths[index],
    mode,
    type: `blob`,
    sha,
  }))
  const { data } = await octo.git.createTree({
    owner,
    repo,
    tree,
    base_tree: parentTreeSha,
  })
  return data
}

export const createNewCommit = async (
  octo: Octokit,
  org: string,
  repo: string,
  message: string,
  currentTreeSha: string,
  currentCommitSha: string
) => {
  const commit = (await octo.git.createCommit({
    owner: org,
    repo,
    message,
    tree: currentTreeSha,
    parents: [currentCommitSha],
  }))
  return commit.data
}

export const setBranchToCommit = (
  octo: Octokit,
  org: string,
  repo: string,
  branch: string = `master`,
  commitSha: string
) =>
  octo.git.updateRef({
    owner: org,
    repo,
    ref: `heads/${branch}`,
    sha: commitSha,
  })
