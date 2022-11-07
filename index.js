'use strict';

const core = require('@actions/core');
const github = require('@actions/github');

(async function () {
  try {
    const token = core.getInput('token');
    const keepCount = core.getInput('keep_count');
    const octokit = github.getOctokit(token);
    const { owner, repo } = github.context.repo;

    let releases = await getSortedReleases(octokit, owner, repo);
    while (releases.length > keepCount) {
      for (let i = keepCount; i < releases.length; i++) {
        await deleteRelease(octokit, owner, repo, releases[i]);
      }
      releases = await getSortedReleases(octokit, owner, repo);
    }

    console.log(`There are ${releases.length} left, we're done here.`);
  } catch (error) {
    core.setFailed(error.message);
  }
})().catch(error => core.setFailed(error.message));

async function deleteRelease(octokit, owner, repo, release) {
  try {
    console.log(`Trying to delete release "${release.name}"...`);
    await octokit.request(
      'DELETE /repos/{owner}/{repo}/releases/{release_id}',
      { owner, repo, release_id: release.id }
    );
    console.log(`Successfuly deleted "${release.name}"`);
  } catch (e) {
    console.log(`Error occurred while deleting release "${release.name}". It will be retried later.`)
  }
}

async function getSortedReleases(octokit, owner, repo) {
  const { data } = (await octokit.request(
    'GET /repos/{owner}/{repo}/releases',
    { owner, repo }
  )) || ({ data: [] });
  return data.sort((a, b) => {
    const versionA = getVersion(a);
    const versionB = getVersion(b);
    return compareVersions(versionB, versionA); // Reverse order
  });
}

function compareVersions(versionA, versionB) {
  return versionA[0] === versionB[0] ?
    versionA[1] === versionB[1] ?
      versionA[2] - versionB[2] :
      versionA[1] - versionB[1] :
    versionA[0] - versionB[0];
}

function getVersion(a) {
  return a.tag_name.match(/\d+\.\d+\.\d+/)
    ? a.tag_name.split('.').map(t => parseInt(t))
    : [0, 0, 0];
}
