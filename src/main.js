const { Octokit } = require("@octokit/core");
const fs = require("fs");
const config = require("../config.json");

// Octokit.js
// https://github.com/octokit/core.js#readme
const octokit = new Octokit({
  auth: config["github-access-token"],
});

async function getIssueList(owner, repo, page) {
  const issues = await octokit.request(
    "GET /repos/{owner}/{repo}/issues?state=closed&per_page=100&page={page}",
    {
      owner,
      repo,
      page,
    }
  );

  // console.log(issues.data);
  if (
    issues !== undefined &&
    issues !== null &&
    Array.isArray(issues.data) &&
    issues.data.length > 0
  ) {
    console.log(
      `GET /${owner}/${repo}/issues page=${page}\t...\t${issues.data.length}`
    );
    const curr = issues.data.map(
      ({ number, created_at, updated_at, closed_at }) => ({
        issue: `#${number}`,
        created_at,
        updated_at,
        closed_at,
      })
    );
    const next = await getIssueList(owner, repo, page + 1);
    return curr.concat(next);
  }
  console.log(`GET /${owner}/${repo}/issues page=${page}\t...\t${0}`);
  return [];
}

let repoList = [];

const args = process.argv.slice(2);

if (args.length < 2) {
  repoList = [
    "https://github.com/apache/zookeeper",
    "https://github.com/apache/rocketmq",
    "https://github.com/apache/freemarker",
    "https://github.com/apache/dubbo",
    "https://github.com/apache/pdfbox",
    "https://github.com/apache/flume",
    "https://github.com/apache/maven",
    "https://github.com/apache/skywalking",
    "https://github.com/apache/druid",
    "https://github.com/apache/hudi",
    "https://github.com/alibaba/fastjson",
    "https://github.com/apache/opennlp",
    "https://github.com/jhy/jsoup",
    "https://github.com/jmrozanec/cron-utils",
    "https://github.com/uniVocity/univocity-parsers",
    "https://github.com/apache/nifi",
    "https://github.com/redis/jedis",
    "https://github.com/alibaba/arthas",
    "https://github.com/alibaba/canal",
    "https://github.com/alibaba/jvm-sandbox",
    "https://github.com/alibaba/jetcache",
    // "https://github.com/alibaba/Alink",
    "https://github.com/alibaba/Sentinel",
  ].map((url) =>
    url
      .replace(
        /^https:\/\/github.com\/([^\/]+)\/([^\/]+)$/,
        (_, p1, p2) => `${p1},${p2}`
      )
      .split(",")
  );
} else {
  repoList = [args];
}

async function main() {
  for ([owner, repo] of repoList) {
    const issues = await getIssueList(owner, repo, 1);
    fs.writeFileSync(
      `./out/issue_${owner}_${repo}.json`,
      JSON.stringify(issues, null, 2)
    );
  }
}
main();
