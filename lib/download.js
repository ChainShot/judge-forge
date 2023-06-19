const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const stream = require("stream");
const util = require("util");

const finished = util.promisify(stream.finished);

// list: https://github.com/ethereum/solc-bin/blob/gh-pages/linux-amd64/list.json
// https://binaries.soliditylang.org/linux-amd64/
const COMPILER_BASE = "https://binaries.soliditylang.org";
const PLATFORM = process.env.PLATFORM || "linux-amd64";

async function download(compilerVersion) {
  const downloadFileDir = path.join(
    __dirname,
    "..",
    "content",
    "cache",
    "compilers"
  );
  await fs.ensureDir(downloadFileDir);
  const downloadFilePath = path.join(
    downloadFileDir,
    "solc-" + compilerVersion
  );
  const absoluteCompilerPath = path.resolve(downloadFilePath);

  if (!(await fs.pathExists(downloadFilePath))) {
    // https://stackoverflow.com/questions/55374755/node-js-axios-download-file-stream-and-writefile
    const writer = fs.createWriteStream(downloadFilePath);
    const compilerURL = `${COMPILER_BASE}/${PLATFORM}/solc-${PLATFORM}-${compilerVersion}`;
    const response = await axios({
      method: "get",
      url: compilerURL,
      responseType: "stream",
    });
    response.data.pipe(writer);
    await finished(writer);
    fs.chmodSync(downloadFilePath, 0o755);
  }

  return absoluteCompilerPath;
}

module.exports = download;
