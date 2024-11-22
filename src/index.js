const fs = require("fs");
const { watch } = require("node:fs/promises");
const http = require("http");
const express = require("express");
const yaml = require("js-yaml");
const commandLineArgs = require("command-line-args");
const WebSocket = require("ws");
const app = express();

const WEB_SOCKET = {
  server: null,
  wss: null,
  ws: null
};

const optsDef = [
  { name: "config", alias: "c", type: String }
];
const opts = commandLineArgs(optsDef);

const initialConfig = yaml.load(fs.readFileSync(opts.config, "utf8"));

// Setup the WebSocket Server prior to HTTP Server
WEB_SOCKET.server = http.createServer();

WEB_SOCKET.wss = new WebSocket.WebSocketServer({ server: WEB_SOCKET.server });
WEB_SOCKET.wss.on("connection", (wsInstance) => {
  WEB_SOCKET.ws = wsInstance; // a Client WebSocket Instance
});

WEB_SOCKET.server.listen(initialConfig.wss_port);

app.get("/", async (req, res) => {
  console.log("Serving /");
  const instanceConfig = yaml.load(fs.readFileSync(opts.config, "utf8"));
  res.send(instanceConfig);
});

app.listen(initialConfig.port, () => {
  console.log(`Server started on ${initialConfig.port}`);
});

// Now that we are listening to the client's requests. Lets setup our watcher
// on the config file
const ac = new AbortController();
const { signal } = ac;
setTimeout(() => ac.abort(), 100000);

(async () => {
  console.log("Setting up watcher");
  const watcher = watch(initialConfig.config, { signal });
  updateClient();
})();

function updateClient() {
  if (WEB_SOCKET.ws === null) {
    setTimeout(() => {
      updateClient();
    }, initialConfig.ws_refresh);
  } else if (WEB_SOCKET.ws?.readyState === 0) {
    // CONNECTING ReadyState
    setTimeout(() => {
      updateClient();
    }, initialConfig.ws_refresh);
  } else if (WEB_SOCKET.ws?.readyState === 2) {
    // CLOSING ReadyState
    setTimeout(() => {
      updateClient();
    }, initialConfig.ws_refresh);
  } else if (WEB_SOCKET.ws?.readyState === 3) {
    // CLOSED ReadyState
    setTimeout(() => {
      updateClient();
    }, initialConfig.ws_refresh);
  } else if (WEB_SOCKET.ws?.readyState === 1) {
    // OPEN ReadyState
    console.log("Sending client update request");
    WEB_SOCKET.ws.send(JSON.stringify({ request: "refresh" }));
  }
}
