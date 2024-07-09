const axios = require("axios");
const { Octokit } = require("@octokit/rest");
const githubToken = process.env.GITHUB_TOKEN;

const pullRequestNumber = process.env.GITHUB_REF.split("/").pop();
const repoFullName = process.env.GITHUB_REPOSITORY;

const octokit = new Octokit({ auth: githubToken });

async function getDiffContent() {
  const { data: pullRequest } = await octokit.pulls.get({
    owner: repoFullName.split("/")[0],
    repo: repoFullName.split("/")[1],
    pull_number: pullRequestNumber,
  });

  const diffUrl = pullRequest.diff_url;
  const { data: diffContent } = await axios.get(diffUrl);

  return diffContent;
}

async function createComment(body) {
  await octokit.issues.createComment({
    owner: repoFullName.split("/")[0],
    repo: repoFullName.split("/")[1],
    issue_number: pullRequestNumber,
    body,
  });
}

module.exports = {
  getDiffContent,
  createComment,
};
