const { Octokit } = require("@octokit/core");
const config = require("../../config.json");

// Octokit.js
// https://github.com/octokit/core.js#readme
const octokit = new Octokit({
  auth: config["github-access-token"],
});

async function getAllCommitHashList(owner, repo, page = 1) {
  const PER_PAGE = 100;
  const result = [];
  const commitList = await octokit.request(
    "GET /repos/{owner}/{repo}/commits{?sha,path,author,since,until,per_page,page}",
    {
      owner,
      repo,
      per_page: PER_PAGE,
      page,
    }
  );
  commitList.data.forEach((commit) => {
    const issues = [];
    commit.commit.message.replace(/(#\d+)/g, (_, p1) => {
      // console.log(match);
      issues.push(p1);
      return p1;
    })
    result.push({
      sha: commit.sha,
      authorDate: commit.commit.author.date,
      commitDate: commit.commit.committer.date,
      committer: commit.commit.committer.name,
      message: commit.commit.message,
      issues,
      parents: commit.parents.map((parent) => parent.sha),
    });
  });
  console.log(
    `GET /${owner}/${repo}/commits page=${page}\t...\t${result.length}`
  );
  if (result.length < PER_PAGE) {
    return result;
  }
  return result.concat(await getAllCommitHashList(owner, repo, page + 1));
}

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
    startPage = Math.floor(start / perpage) + 1;
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
  getAllCommitHashList,
};
