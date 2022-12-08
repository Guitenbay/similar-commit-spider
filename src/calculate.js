const repoList = [
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

for ([owner, repo] of repoList) {
  const issues = require(`../out/issue_${owner}_${repo}.json`);
  // console.log(`${owner}/${repo}\t${issues.length}`);
  console.log(`${issues.length}`);
  
}