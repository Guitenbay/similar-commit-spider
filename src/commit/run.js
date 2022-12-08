const { getCommitInfo } = require("./commit");
const { getCommitHashList } = require("./list");

function calculateSimilar(filesA, filesB) {
  let result = 0;
  const files = [];
  for (let a of filesA) {
    for (let b of filesB) {
      if (a.filename === b.filename) {
        result++;
        const paths = a.filename.split('/');
        files.push({
          filename: paths[paths.length - 1],
          patchHeadA: a.patchHeads.join('|'),
          patchHeadB: b.patchHeads.join('|'),
        });
      }
    }
  }
  const divider = Math.min(filesA.length, filesB.length);
  return { value: divider === 0 ? 0 : result / divider, files };
}

async function main() {
  const [owner, repo] = ["apache", "skywalking"];
  const list = await getCommitHashList(owner, repo, 10);

  const commit_list = [];
  let i = 0,
    len = list.length;
  for (let commit of list) {
    const { sha, date } = commit;
    console.log(`${++i}/${len} GET commit ${sha} ...`);
    const detail = await getCommitInfo(owner, repo, sha);
    const files = detail.files
      .filter(({ filename }) => {
        const res = /.+\.(md|json|yml|yaml)$/.test(filename);
        // console.log(!res, filename)
        return !res;
      })
      .map((file) => {
        // console.log(file.patch.split("\n"));
        // @@ -0,0 +1,69 @@
        const heads = file.patch
          .split("\n")
          .filter((line) => {
            const res = /^@@\s\-\d+,\d+\s\+\d+,\d+\s@@/.test(line);
            // console.log(res, line);
            return res;
          }).map((line) => line.replace(/^@@\s(\-\d+,\d+\s\+\d+,\d+)\s@@.*/, (_, p1) => p1));
        // console.log(heads);
        return { filename: file.filename, patchHeads: heads };
      })
      .sort(({ filename: a }, { filename: b }) => a.localeCompare(b));

    commit_list.push({ idx: i, sha, date, files });
  }

  const highSimilarPairs = [];
  const header =
    "0\tx\t" + commit_list.map(({ sha }) => sha.substr(0, 6)).join("\t") + "\n";
  // 计算 commit 相似度
  const lines = commit_list.map((me, index) => {
    let line = `${me.idx}\t${me.sha.substr(0, 6)}\t`;
    for (let j = 0; j < commit_list.length; j++) {
      const { value: similar, files: similarFiles } = calculateSimilar(
        me.files,
        commit_list[j].files
      );
      // 只获取一次相似对，且保证前面的 commit 是最新的
      if (j > index) {
        if (similar > 0) {
          highSimilarPairs.push({
            first: me.sha.substr(0, 10),
            last: commit_list[j].sha.substr(0, 10),
            far: j - index,
            similarFiles,
          });
        }
      }
      line = line + `${similar.toFixed(3)}\t`;
    }
    return line + "\n";
  });
  console.log(header + lines.join(""));
  highSimilarPairs.forEach(({ first, last, far, similarFiles }) => {
    console.log(
      `%c ${first} %c ${last} %c ${far}`,
      "background:#35495e ; padding: 1px; border-radius: 3px 0 0 3px;  color: #fff",
      "background:#41b883 ; padding: 1px; border-radius: 0 3px 3px 0;  color: #fff",
      "background:transparent"
    );
    console.table(similarFiles, ['filename', 'patchHeadA', 'patchHeadB']);
  });
}

main();
