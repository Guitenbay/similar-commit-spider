const { Octokit } = require("@octokit/core");
const fs = require("fs");
const path = require("path");
const config = require("../../config.json");

// Octokit.js
// https://github.com/octokit/core.js#readme
const octokit = new Octokit({
  auth: config["github-access-token"],
});

async function getCommitInfo(owner, repo, commit) {
  const commitDetail = await octokit.request(
    "GET /repos/{owner}/{repo}/commits/{ref}",
    {
      owner,
      repo,
      ref: commit,
    }
  );
  // console.log(commitDetail);
  return {
    commit: commitDetail.data.sha,
    committer: commitDetail.data.commit.author.name,
    date: commitDetail.data.commit.author.date,
    message: commitDetail.data.commit.message,
    files: commitDetail.data.files.map((file) => {
      return {
        filename: file.filename,
        patch: file.patch,
      };
    }),
  };
}

let repoDetail = ["alibaba", "fastjson"];

// let commitList = [
//   "00cdc53606111e7802f8f5559d44feeccba2657f",
//   "016ddf6dd881850d86ca33b614fc431c4d55bda8",
//   "0375eb649670a27738c5551f8506777d16a56617",
//   "04007da969d0875eb8fbbf5631fc40368f06975d",
//   "0556cf774d18b2a90e1341c1cedf3cd84be207b2",
//   "071f1bbd5604909100a8e2cfdaf0fe8793d9f55c",
//   "07556942be5a6adf63672cdc366adad4800e2365",
//   "07add5449ef0bc9dc977891207d5dbd3d5130ad3",
//   "07e7ba5982fe0ba3e8a75ba034102d8d71c1f1d0",
//   "0ac9d327e5f8f504e07ca6d9763443b81ba9ca44",
//   "0b8dea27c350d0c318b197811c6a102bed9a2de2",
//   "0b9f09beb55b5e42ff4a0030420c9e7dc2dc0639",
//   "0be1525cdc4ab39cca7a4052eacc16afc23abe48",
//   "0f30967e5a86aa518fdfbb7990a9ccca433f763f",
//   "0fa197aedf21e92f5b445c649550d1c95390b5cc",
//   "104dfe0e21b6cb942e5939d6aa0938283d0fd1d2",
//   "1123f7d769407b3ab06124a89d8cc95d58d58e41",
//   "1219227605e360e72863d133087e2086cdad7fbc",
//   "1286becf8fa258f47c0d0a3f6cddc48677ac3256",
//   "14b5888db81882aacea3e58d4a83552745e7b0be",
//   "15dead6fcbb32402b9a3a4802c24f1780d6e1901",
//   "16679b0a2485f0df294af0a259b60da1c787072e",
//   "16c9be4571275c849db633b43fbfa2c354c5cb83",
//   "178fc2df6677c70cd1bd390ed59cf846260fa40a",
//   "1804c85adea41809d9d171fbc271c2f53af93edf",
//   "199b68352bd358cabb388a7a2d883ca233a30899",
//   "1a37029123a7100852b58b57923348149c82b3ef",
//   "1ad159e14992492fc359c4df9d1af8e16136e180",
//   "1aeca9c7bf20841965bd056bd917e368ee343a0c",
//   "1c762016604fa3289c2bfa51785f910a69f73b89",
//   "1ddcf0c37345e2c733eba22a0ad0d5d007276b63",
//   "1e6bc712ef549932f094bd482fc5bb40b3ad628a",
//   "1f6d9c90f2b3b83020485fa16b7b405caf012152",
//   "1f98b0ea33fa9e060f80be84371002caf47e859d",
//   "1ffa44c25e367981762d2ea29f120b719846a94d",
//   "20b16dee6fd38eec80ace753cd126d0ef0aba8b2",
//   "20d0c3afacfb42f54344eec85e2e7c0d308a8fae",
//   "21c2f4b2f963c044e4adafef4ddd966661526af9",
//   "22abbf7c2fbe6548af6f4e622e648e4f396f0b0f",
//   "23070b2ccd30c5bb3d78e735b098f835756a190a",
//   "25ce5bc23914d19093dd0e2587716b07569779f1",
//   "2629fef0848fe727d1f28e3dee8422688ff8d12e",
//   "26990ad3bfb4554e944f2d2da45fcc08b8786906",
//   "27ff9a8ef6420b8c4c6241a3a398a458b2760e8d",
//   "294bb2696fc1c12cc2ea3979345f7a31398fc202",
//   "296fbdb5c555c10321e56eebdb62b146b0606d66",
//   "2a603b9d03a2de3fd48dfeaaf5df64a08955ed56",
//   "2aa476dcfec1da8dc2dd0f64b15fadeaf29b9a67",
//   "2b09fab49e92550246759a2beab9a728391a0c14",
//   "2bf71e25686e2abad61a5a8d65687eebc522d62c",
//   "2f1127017be74efe89a16eb08d83dd629728faa2",
//   "3179f1045f8fcc00794f7f83048d878ffaf1c38d",
//   "3286378be6c36fe5a2f8fe4a36b0dfba67d4c36d",
//   "333f11f2cffeb764da7da27d4e83e3b8363427ab",
//   "341fc39f1b341ff1574e83c6cf51536cce758fcf",
//   "362eb79838854c1b18ea8bbd456b296dde402b30",
//   "3673dfdfaf4da928d77bf76e57735d3a544cbb9a",
//   "37800d8d92060e23e531b2c4ab15898ad1af10d1",
//   "38070ca5a2713795403334c78f43470a560684b7",
//   "3b370ac07cef990eb0a10eeeb6388b2b91feada8",
//   "3e2fa459144bf08bdf4f6108f74875e23ff19748",
//   "3f97578b882ef04359a3898998610fae7e5fab50",
//   "4199cf356cdfe7fae3f506d0229037e6e2cae39c",
//   "41beb7102a1970cf106e535f1bf55edebc16a788",
//   "424b01452150914b2c1b520f0f4e5ba87916a525",
//   "46de8abd62636e14e6bec503bcf8752309809250",
//   "4751ac5c3e4f0e043ed4e1b92ae6d24cc28ece27",
//   "47feb4cec4b06a88b8f7d47b0cdf3d2e6fb2c781",
//   "4a00e8d4f5dea920a84fda05ff470d2b3c66c7c0",
//   "4bdfe34a0ec06446bc5963f92a7561a4263fdb0e",
//   "4d3f6339a624d11baa64562ca15e630c7459d9d8",
//   "4d727899e8e7c700148639ce20c84ca426ecb1ce",
//   "4f4aea08c872aacec67aefd19faea57f0f278267",
//   "52652252e7095ecb11bfe8baddd2a087c04fa14e",
//   "539fe135aee3299fe1135e6e49a61f23bd5ebe33",
//   "53a5e09b0e3424cc7aced37f3d9e98fa93829fa5",
//   "5446e010a05b3fca004d82d407e43160583007e9",
//   "54debd0460cbcb1afcecf1340c718b6114ee0005",
//   "5831d2b862845d86132ebd4659d4afc3c83a71a7",
//   "59b0a3122fd1023ba4bb811982b77a1bee84e395",
//   "5d3b70622d0a9dd904bbf4e87c19a561c77d1d4f",
//   "5ed8d9aa5cb7f633d220d98cb487f32ac1770e36",
//   "604f38f0e60a3fbb1de52afa8d93a913d45d567f",
//   "60ebb222c5770f6a8e1675eb9bbd6933e6d07b6b",
//   "63fd110f5344db2e938df5d6678463617a5eb9ef",
//   "654ea41bb0187863eb2db7ab6528c081850183b8",
//   "66978ef79aeea3e0b9b701324156245455286dc3",
//   "66b5e6cd327acb868b2f2741b518a04179247526",
//   "677aa67ee9c9bab76446b15e7309264ee0dce15e",
//   "69fb121cc09b8fdf6c4aa63fbb634c1e322641db",
//   "6a3102fe5af420395ffd91c698ef6162f7bc970d",
//   "6a787a70ca58be7ac59193ba8ea76c4bb5508374",
//   "6ad50106314398c837ecf37600d7ea57f75950c0",
//   "6b3ba9232570ab991e2bbd3e52f98133544ac9bd",
//   "6b534f7247eecb6e70e5f9f099d1cc289fd7eb18",
//   "6da5de016a20d991cd3d729e16a0c2b9f548f453",
//   "718424132591c2b00144d15919548c1ec9043bc1",
//   "7195068b75b831b45b4549a24ff382086ea739b0",
//   "733314a465af6850e65feee1060802e683a8b6eb",
//   "75e2054bf96c0a4072406d98aedce9a21ef454b5",
//   "771af47385330bf0505b47527698d055d883ddf5",
//   "7745948d180c6baa5bff24b450ae72d8c9030925",
//   "789f983b340c1140d2a93b1af6a0df73052c14b6",
//   "7987638b97cdbb9089f6fe794fbb65d4e3466908",
//   "7a8f77ece75a7310f5f3d66642c7ba85e2765314",
//   "7acfce69f4372d7ff3ee7a77fc8c14345c7a1ec0",
//   "7b17321ad2b1e0d5bb5e866eba49d5833b9f9ee0",
//   "7c7dc80b19eb8f26c23b6335110e67f32249457d",
//   "7cc927a8a857a33c7bafa2a5a19a598eaf3f1037",
//   "811a6c3fdbc30d474b63ba649655125234f37a57",
//   "81819bea99fb3fdb59907990cc5e9ec023a2b749",
//   "820d6393c06e4459030a52d3ea31d2c62b9348c3",
//   "83da96414cf6f76f5d697a8ea408674b23a50c3d",
//   "83fd2416209dafbdf991da77d8d4ea26ff457473",
//   "85fdac68505fe5c1d525fe03b7febbfada3618fc",
//   "8bb3e504401127940bc6b7a621cb3673f53b759a",
//   "8d42fd87c00b9691d393c15998135b5281d895f5",
//   "8e985930057c21c95a3065ca9f2cad3b5e42d4ba",
//   "8f73f5fceb290c0116d52e9766e3815d0ebea790",
//   "8f78114439568f81c14b87c3b6d9a7702b60c38f",
//   "902ef14238d57ec89ef8d9354556810191236f55",
//   "9038e3bca50fde97da008f370d72d7afa774ee5d",
//   "92b9986bd0c48759694a83cac77858f293801a11",
//   "92fd0cb92cd876e01384418b6dbcae557a8a630c",
//   "96d0ee532a37351a126ebef2d5071964c33a1ec7",
//   "991f446051b9b54fd67ed0a964d46df1119bf666",
//   "9c11273c22733f01c8a462b9922357faeb8810db",
//   "9f8585e0086fc3c6be52b51e24c1f8f96fe64690",
//   "a05e3e017f338790b171920bc14e8bfda02e7568",
//   "a117a37cdf8172748dde4c00d06fca06a0ef29c4",
//   "a1bf53bed50d798d805377dd97574d0d6602a454",
//   "a3583311b4719119484adea4931bf02c1a3d69a6",
//   "a527bc9cc72b07cefd209e4bf5e82b330dec9e16",
//   "a6fae9f1f50bc1cef35067b6680e15c406e670eb",
//   "a7f1f5c4ac52503cc95bf1d27498098b3093a0df",
//   "a9bcb72ccc6c843ee76c40c348943ca6155c05f6",
//   "ab82d0bacadd04226f3f926463ff6a56980c7a4b",
//   "acae9b2db44eba297758b683deef668c16ad32c7",
//   "acc20a8133c5f9c6bb9b3e541f845e7445c7bb54",
//   "ad88fd0881c4fbd284a636614e4730dc4e0ba081",
//   "aeadea091d8c7a88148ddfce2e1c871d799423d8",
//   "b032cf54dbaced0740f50488fb6ab0b2c4c46bd0",
//   "b234ebdbe61bae5ed80ce8665368e3398ad44cb0",
//   "b23548def85686b8412242b9aa21b13c98ecd7db",
//   "b273b032cac979d514e464f12ee57e1e3dd167e9",
//   "b313c2e4c395d96d2eab8d316594ab88797c3101",
//   "b4dec47d9ccd6884ddc8e2f3376933ccdc238ca4",
//   "b5fbf245c0cb93ce36789e884f896184562ed21d",
//   "b89fa663074d5fdb0d41d229804cc293f9ce9e42",
//   "ba07c7fbda7ffb4f5fad24f5d02c03794db8c7c9",
//   "c0b2b4d1812e56db4a1489ebd22b8bbea5751225",
//   "c17b1acdfe66fb096cbd2a57fcd93f001bca66ab",
//   "c2637287d6803bd0e51601ef76c51da044ef1b6b",
//   "c4343c398b1ab609251bad4c13112a428aaa62ec",
//   "c47bfe2726d952fb97ec4fcb147796876ab8273b",
//   "c8bc4a9e1a7992146403b1caa11e9b9f981b2f11",
//   "c9ac33b03706e7dd79e1e207771bca26534d78d7",
//   "ccb440c8e8b45c8daf72afb865fdad771612a64a",
//   "cd5414d524f2f743936941c12c04edd0afc64e55",
//   "ce11a7b93725d2bfa8b492beff8a29fe853e0d5f",
//   "cf5ba3a3ecb552dd040de8260a03dcc8950faa4f",
//   "d1184e51a1c6346f0601bcab6027b4e26c48d273",
//   "d30069235d846b910d8371171aa855e4eea3a97b",
//   "d9814dbc65d03696fbaea5e339dc57aca12d5907",
//   "da2a7836c5cdf32a8ea95ef87c769744ae66d908",
//   "da8b3bd240061bf564b804954db9a6008e2474aa",
//   "db0789fca9625c268615fb8261ef43951b15e889",
//   "dd1cec42ea59cfd953ef159f8173560ee2fb2832",
//   "dd532e87929cccaa5fed42ee76e62477fd134aa7",
//   "df8daa40356236a2133e335f6ea0a671e89663b0",
//   "e04d4533ea22a5ca6e680785a831e4fb7af4a83e",
//   "e2d6a860edd242203b25b4c61c9d209fb1d6be76",
//   "e3392543b75444302c29c8c800c286c2ca19fab2",
//   "e70283809f26c06e22fbe8551b6ebe60aac1dd65",
//   "e8ec59ee44d0fe54355c790deb782a35dae9a628",
//   "e96e416ab3ef072bbea1933347fe072bc3990aba",
//   "ea0dd8ac0d3a6c5c7a9e265553e95cb4a30d8714",
//   "ec9e2caf4a5cb29c060569fff02b9993aa44093a",
//   "ecd79c88b8b432066139d31d5fc6a64176f64f8d",
//   "ed6219b5e8269387b7c7377da396f0bc392aab37",
//   "edf8c43e9f3aa41c6c757f4095327bd75ed9e2c8",
//   "f1177257a836c150bef34dbe3799b3e0c1ccd5aa",
//   "f1cafd432e540082dc4fdca0b090e1c2ea59edc5",
//   "f2654b51dc3f5622a918d44417f7fa26c99f2fd4",
//   "f2de5ba9bc8ecaf57a37538c9a24a0de8a15ad94",
//   "f35b35b48842a7cd866051d49b47fa9bd574d2de",
//   "f5b7a5fce0b61e7150bb27813135e1b1efb97b46",
//   "f5b9260e6659c8e0962977f9b3d7211e5c921746",
//   "f5e9d59a441601f517a1cc9efe10d5ee72864ca8",
//   "f83fee8d1e6a10e93337ec5b2d36bb20b508511f",
//   "ffa02d528d1bb83476cba8d591d8ed1306775b75",
// ];

async function main() {
  const [owner, repo] = repoDetail;
  const len = commitList.length;
  const commitDetails = ["commit,message,committer,date,"];
  const commitFileMap = new Map();
  let i = 0;
  for (let commit of commitList) {
    console.log(`${++i}/${len} GET commit ${commit} ...`);
    const detail = await getCommitInfo(owner, repo, commit);
    const filenames = detail.files.map(({ filename }) => filename).sort((a, b) => a.localeCompare(b)).join(",");

    commitDetails.push(
      `${detail.commit},${detail.message.replace(/,/g, '&/&').replace(/\n/g, '&n&')},${detail.committer.replace(',', '&/&')},${detail.date},${filenames},`
    );
  }
  fs.writeFileSync(
    path.join(__dirname, "../../out/fastjson_commit.csv"),
    commitDetails.join("\n")
  );
}
// main();

module.exports = {
  getCommitInfo
};
