const fs = require("fs");
const process = require("node:process");
const crypto = require("node:crypto");
const core = require("@actions/core");
const exec = require("./exec");
const Tail = require("tail").Tail;

const run = (callback) => {
  const username = core.getInput("username");
  const password = core.getInput("password");
  const privateKeyFileName = core.getInput("private_key_filename");
  const privateKeyPassword = core.getInput("private_key_password");
  const echoConfig = core.getInput("echo_config");

  core.info("Starting OpenVPN Connect for DI PUC-Rio Action");

  const configFile = `${crypto.randomBytes(20).toString('hex')}.ovpn`;
  const upFile = `${crypto.randomBytes(20).toString('hex')}.txt`;
  const pkpFile = `${crypto.randomBytes(20).toString('hex')}.txt`;

  console.log(`::add-mask::${configFile}`);
  console.log(`::add-mask::${upFile}`);
  console.log(`::add-mask::${pkpFile}`);

  exec(`echo $CONFIG_FILE | base64 --decode > .github/${configFile}`);
  exec(`echo $PRIVATE_KEY_FILE | base64 --decode > .github/${privateKeyFileName}`);

  // 1. Configure client

  fs.appendFileSync(`.github/${configFile}`, "\n# ----- modified by action -----\n");

  // username & password auth
  if (username && password) {
    fs.appendFileSync(`.github/${configFile}`, `auth-user-pass ${upFile}\n`);
    fs.writeFileSync(`.github/${upFile}`, [username, password].join("\n"), { mode: 0o600 });
  }

  if (privateKeyPassword) {
    fs.writeFileSync(`.github/${pkpFile}`, privateKeyPassword, { mode: 0o600 });
  }

  if (echoConfig === "true") {
    core.info("========== begin configuration ==========");
    core.info(fs.readFileSync(`.github/${configFile}`, "utf8"));
    core.info("=========== end configuration ===========");
  }
  // 2. Run openvpn

  // prepare log file
  fs.writeFileSync(".github/openvpn.log", "");
  const tail = new Tail(".github/openvpn.log");

  const workingDir = process.cwd();

  try {
    exec(`sudo openvpn --cd ${workingDir}/.github --config ${configFile} --askpass ${pkpFile} --daemon --log openvpn.log --verb 0 --writepid openvpn.pid`);
  } catch (error) {
    core.error(fs.readFileSync(".github/openvpn.log", "utf8"));
    tail.unwatch();
    throw error;
  }

  tail.on("line", (data) => {
    core.info(data);
    if (data.includes("Linux route add command failed")) {
      tail.unwatch();
      clearTimeout(timer);
      fs.rmSync(`.github/${pkpFile}`);
      fs.rmSync(`.github/${configFile}`);
      fs.rmSync(`.github/${upFile}`);
      fs.rmSync(`.github/${privateKeyFileName}`);
      setTimeout(() => {
        const pid = fs.readFileSync(".github/openvpn.pid", "utf8").trim();
        core.info(`VPN connected successfully. Daemon PID: ${pid}`);
        callback(pid);
      }, 1000);
    }
  });

  const timer = setTimeout(() => {
    core.setFailed("VPN connection failed.");
    tail.unwatch();
  }, 60000);
};

module.exports = run;
