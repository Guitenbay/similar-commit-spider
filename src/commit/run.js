const { getCommitInfo } = require("./commit");
const { getCommitHashListFrom } = require("./list");

function overlapsOfTwoLine(lineA, lineB) {
  let lineBefore;
  let lineAfter;
  if (lineA.start <= lineB.start) {
    lineBefore = lineA;
    lineAfter = lineB;
  } else {
    lineBefore = lineB;
    lineAfter = lineA;
  }
  if (lineBefore.start + lineBefore.length <= lineAfter.start) {
    // 不重合
    return false;
  } else {
    return true;
  }
}

function findCoincidePatch(patchAs, patchBs) {
  const lineAs = patchAs.map((patch) => {
    const aStart = patch
      .replace(/^\-(\d+),(\d+)\s\+\d+,\d+$/, (_, p1, p2) => `${p1},${p2}`)
      .split(",");
    // console.log("a", aStart);
    return { start: +aStart[0], length: +aStart[1] };
  });
  const lineBs = patchBs.map((patch) => {
    const bStart = patch
      .replace(/^\-\d+,\d+\s\+(\d+),(\d+)$/, (_, p1, p2) => `${p1},${p2}`)
      .split(",");
    return { start: +bStart[0], length: +bStart[1] };
  });
  let result = [];
  for (let lineA of lineAs) {
    for (let lineB of lineBs) {
      if (overlapsOfTwoLine(lineA, lineB)) {
        result.push(`${lineA.start}-${lineB.start}`);
      }
    }
  }
  if (result.length === 0) return "0";
  return result.join(",");
}

function calculateSimilar(filesA, filesB) {
  let result = 0;
  const files = [];
  for (let a of filesA) {
    for (let b of filesB) {
      if (a.filename === b.filename) {
        result++;
        const coincide = findCoincidePatch(a.patchHeads, b.patchHeads);
        const paths = a.filename.split("/");
        files.push({
          filename: paths[paths.length - 1],
          patchHeadA: a.patchHeads.join("|"),
          patchHeadB: b.patchHeads.join("|"),
          coincide,
        });
      }
    }
  }
  const divider = Math.min(filesA.length, filesB.length);
  return { value: divider === 0 ? 0 : result / divider, files };
}

async function findSimilarForCommitBlock(list, owner, repo) {
  const commit_list = [];
  let i = 0,
    len = list.length;
  for (let commit of list) {
    const { sha, date } = commit;
    console.log(`${++i}/${len} GET commit ${sha} ...`);
    const detail = await getCommitInfo(owner, repo, sha);
    const files = detail.files
      .filter(({ filename }) => {
        const res = /.+\.(md|json|yml|yaml|xml|scss|tsx|spelling)$/.test(
          filename
        );
        // console.log(!res, filename)
        return !res;
      })
      .map((file) => {
        // console.log(file.patch.split("\n"));
        // @@ -0,0 +1,69 @@
        const heads =
          file.patch === undefined
            ? []
            : file.patch
                .split("\n")
                .filter((line) => {
                  const res = /^@@\s\-\d+,\d+\s\+\d+,\d+\s@@/.test(line);
                  // console.log(res, line);
                  return res;
                })
                .map((line) =>
                  line.replace(
                    /^@@\s(\-\d+,\d+\s\+\d+,\d+)\s@@.*/,
                    (_, p1) => p1
                  )
                );
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
    console.table(similarFiles, [
      "filename",
      "coincide",
      "patchHeadA",
      "patchHeadB",
    ]);
  });
}

async function main() {
  let [_, __, ...arguments] = process.argv; // 参数数组
  const [owner, repo, startStr, lengStr] = arguments;
  const start = +startStr; // 获取arg1
  const leng = +lengStr; // 获取arg2
  // console.log(start, leng);
  // const ALLLENGTH = 100,
  //   BLOCK = leng ?? 10,
  //   STEP = 5;
  const list = await getCommitHashListFrom(owner, repo, start, leng);

  // const block_list = [];
  // // 按 10 个一组，每组间隔 5 的方式 卷积切分 list
  // for (let i = 0; i < ALLLENGTH; i += STEP) {
  //   block_list.push(list.slice(i, i + BLOCK));
  // }

  // for (let block of block_list) {
  findSimilarForCommitBlock(list, owner, repo);
  // }
}

main();
