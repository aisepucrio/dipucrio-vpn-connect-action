const fs = require("fs");
const core = require("@actions/core");
const exec = require("./exec");
const Tail = require("tail").Tail;

const run = (callback) => {
  const configFile = core.getInput("config_file", { required: true });
  const username = core.getInput("username");
  const password = core.getInput("password");
  const privateKeyPassword = core.getInput("private_key_password");
  const echoConfig = core.getInput("echo_config");

  if (!fs.existsSync(configFile)) {
    throw new Error(`config file '${configFile}' not found`);
  }

  // 1. Configure client

  fs.appendFileSync(configFile, "\n# ----- modified by action -----\n");

  // username & password auth
  if (username && password) {
    fs.appendFileSync(configFile, "auth-user-pass up.txt\n");
    fs.writeFileSync("up.txt", [username, password].join("\n"), { mode: 0o600 });
  }

  if (privateKeyPassword) {
    fs.writeFileSync("pkp.txt", privateKeyPassword, { mode: 0o600 });
  }

  if (echoConfig === "true") {
    core.info("========== begin configuration ==========");
    core.info(fs.readFileSync(configFile, "utf8"));
    core.info("=========== end configuration ===========");
  }
  // 2. Run openvpn

  // prepare log file
  fs.writeFileSync("openvpn.log", "");
  const tail = new Tail("openvpn.log");

  try {
    exec(`sudo openvpn --config ${configFile} --askpass pkp.txt --daemon --log openvpn.log --writepid openvpn.pid`);
  } catch (error) {
    core.error(fs.readFileSync("openvpn.log", "utf8"));
    tail.unwatch();
    throw error;
  }

  tail.on("line", (data) => {
    core.info(data);
    if (data.includes("Initialization Sequence Completed")) {
      tail.unwatch();
      clearTimeout(timer);
      const pid = fs.readFileSync("openvpn.pid", "utf8").trim();
      core.info(`VPN connected successfully. Daemon PID: ${pid}`);
      callback(pid);
    }
  });

  const timer = setTimeout(() => {
    core.setFailed("VPN connection failed.");
    tail.unwatch();
  }, 60000);
};

module.exports = run;
