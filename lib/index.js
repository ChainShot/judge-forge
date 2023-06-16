const path = require("path");
require("dotenv").config(path.join(__dirname, ".."));
const fs = require("fs-extra");
const childProcess = require("child_process");

const ARGS = ["setup", "run"];
const TOP_LEVEL_FOLDER = path.join(__dirname, "..");
const CONTENT_FOLDER = path.join(TOP_LEVEL_FOLDER, "content");
const CWD = process.cwd();
const FORGE_CMD = "/usr/local/cargo/bin/forge";

module.exports = async () => {
  const args = process.argv.slice(2);
  const command = args[0];
  if (ARGS.indexOf(command) < 0) {
    const usage = (
      await fs.readFile(path.join(__dirname, "usage.txt"))
    ).toString();
    console.log(usage);
    return;
  }
  if (command === "setup") {
    fs.mkdirSync(CONTENT_FOLDER);

    // operate on the content folder as the CWD
    process.chdir(CONTENT_FOLDER);

    // set up a git repo so forge doesn't use the parent git repo (this one)
    childProcess.execSync("git init");

    // dont install the depedencies upon init or else we need to commit to clean the work dir
    // (ugh git submodules are a pain)
    childProcess.execSync(`${FORGE_CMD} init . --no-deps --force`, {
      stdio: [0, 1, 2],
    });

    // install the depedencies at their respective versions
    // not sure how we'll make multiple instances of forge deps in the future, but at least this pins the versions for now
    childProcess.execSync(
      `${FORGE_CMD} install foundry-rs/forge-std@v1.5.6 OpenZeppelin/openzeppelin-contracts@v4.9.1`,
      { stdio: [0, 1, 2] }
    );

    // go ahead and test to build up the cache/compilation artifacts
    childProcess.execSync(`${FORGE_CMD} test -vv --json`, { stdio: [0, 1, 2] });
  } else if (command === "run") {
    await copyContents();

    childProcess.execSync(`${FORGE_CMD} test -vv --json`, { stdio: [0, 1, 2] });
  }
};

async function copyContents() {
  await fs.copy(
    path.join(CONTENT_FOLDER, "foundry.toml"),
    path.join(CWD, "foundry.toml")
  );
  await fs.copy(path.join(CONTENT_FOLDER, "lib"), path.join(CWD, "lib"));
  await fs.copy(path.join(CONTENT_FOLDER, "out"), path.join(CWD, "out"));
  await fs.copy(path.join(CONTENT_FOLDER, "cache"), path.join(CWD, "cache"));
}
