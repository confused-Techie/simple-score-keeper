const fs = require("fs");
const path = require("path");
const express = require("express");
const yaml = require("js-yaml");
const commandLineArgs = require("command-line-args");
const WebSocket = require("ws");
const ejs = require("ejs");

// === Configure Application
const optsDef = [
  { name: "config", alias: "c", type: String }
];

const opts = commandLineArgs(optsDef);

const config = yaml.load(fs.readFileSync(opts.config, "utf8"));

// === Setup WebSocket Connections
const webSocket = {
  server: null, // Server Instance the WebSocket is bound to
  wss: null, // The WebSocket Server
};

const wss = new WebSocket.WebSocketServer({ port: config.port });

wss.on("connection", (wsInstance, req) => {
  wsInstance.on("error", console.error);

  wsInstance.on("message", (data, isBinary) => {
    // Once we get any data from a WebSocket Client, we will broadcast this data
    // to all connected clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        console.log(data.toString());
        client.send(data, { binary: isBinary });
      }
    });
  });
});

// === Setup HTTP Server
const app = express();

app.get("/", async (req, res) => {

  res.send(
    ejs.render(fs.readFileSync("./src/home.ejs", { encoding: "utf8" }), config)
  );

});

app.get("/live", async (req, res) => {
  res.send(
    ejs.render(fs.readFileSync("./src/live.ejs", { encoding: "utf8" }), config)
  );
});

app.get("/site.css", (req, res) => {
  res.sendFile(path.resolve("./src/site.css"));
});

app.get("/site.js", (req, res) => {
  res.sendFile(path.resolve("./src/site.js"));
});


app.listen(config.port, () => {
  console.log(`Server started on ${config.port}`);
});
