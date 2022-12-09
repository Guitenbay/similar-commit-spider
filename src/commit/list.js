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
      result.push({ sha: commit.sha, date: commit.commit.author.date });
    });
  }
  // console.log(commitDetail);
  return result;
}

async function getCommitHashListFrom(owner, repo, start, length) {
  let startPage = 0;
  let perpage = 0;
  let limit = 0;
  let endPage = 0;
  let sliceStart = 0;
  if (start < 100 && length <= start) {
    perpage = start;
    startPage = 2;
    endPage = 2;
  } else {
    limit = start + length;
    perpage = limit < 100 ? limit : 100;
    sliceStart = start % perpage;
    startPage = start === 0 ? 1 : Math.ceil(start / perpage);
    endPage = Math.ceil(limit / perpage);
  }
  // console.log(start, length, limit, perpage, sliceStart, startPage, endPage);

  const result = [];
  for (let i = startPage; i <= endPage; i++) {
    const commitList = await octokit.request(
      "GET /repos/{owner}/{repo}/commits{?sha,path,author,since,until,per_page,page}",
      {
        owner,
        repo,
        per_page: perpage,
        page: i,
      }
    );
    // console.log('GET repo list ', perpage, i);
    commitList.data.forEach((commit) => {
      result.push({ sha: commit.sha, date: commit.commit.author.date });
    });
  }
  // console.log(commitDetail);
  return result.slice(sliceStart, sliceStart + length);
}

module.exports = {
  getCommitHashList,
  getCommitHashListFrom,
};
