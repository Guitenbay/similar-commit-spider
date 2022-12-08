const { Octokit } = require("@octokit/core");
const config = require("../../config.json");

// Octokit.js
// https://github.com/octokit/core.js#readme
const octokit = new Octokit({
  auth: config["github-access-token"],
});

async function getCommitHashList(owner, repo, limit) {
  const little = limit < 100;
  const PER_PAGE = little ? limit : 100;
  const totalPage = little ? 1 : Math.ceil(limit / PER_PAGE);
  const result = [];
  for (let i = 0; i < totalPage; i++) {
    const commitList = await octokit.request(
      "GET /repos/{owner}/{repo}/commits{?sha,path,author,since,until,per_page,page}",
      {
        owner,
        repo,
        per_page: PER_PAGE,
        page: i + 1,
      }
    );
    commitList.data.forEach((commit) => {
      result.push({ sha: commit.sha, date: commit.commit.author.date })
    })
  }
  // console.log(commitDetail);
  return result;
}

module.exports = {
  getCommitHashList,
};
