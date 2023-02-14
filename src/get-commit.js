const fs = require("fs");
const { getAllCommitHashList } = require("./commit/list");

let repoList = [];

const args = process.argv.slice(2);

if (args.length < 2) {
  repoList = [
    "https://github.com/alibaba/fastjson",
    "https://github.com/alibaba/canal",
    "https://github.com/alibaba/Sentinel",
    "https://github.com/apache/skywalking",
    "https://github.com/apache/zookeeper",
    "https://github.com/apache/rocketmq",
    "https://github.com/apache/dubbo",
    "https://github.com/apache/druid",
    "https://github.com/redis/jedis",
    "https://github.com/jmrozanec/cron-utils",
    "https://github.com/uniVocity/univocity-parsers",
    // --------
    "https://github.com/apache/hudi",
    "https://github.com/alibaba/arthas",
    "https://github.com/apache/pdfbox",
    "https://github.com/apache/flume",
    "https://github.com/apache/maven",
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
  let i = 0;
  for ([owner, repo] of repoList) {
    console.log(`${++i} / ${repoList.length} :----`);
    const commit = await getAllCommitHashList(owner, repo);
    console.log(
      `GET /${owner}/${repo}/commits list: ${commit.length}`
    );
    fs.writeFileSync(
      `./out/commit/commit_${owner}_${repo}.json`,
      JSON.stringify(commit, null, 2)
    );
  }
}
main();
