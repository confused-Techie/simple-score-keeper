const fs = require("fs");
const path = require("path");
const express = require("express");
const yaml = require("js-yaml");
const commandLineArgs = require("command-line-args");
const ejs = require("ejs");
const app = express();

const optsDef = [
  { name: "config", alias: "c", type: String }
];

const opts = commandLineArgs(optsDef);

const config = yaml.load(fs.readFileSync(opts.config, "utf8"));

app.get("/", async (req, res) => {

  res.send(
    ejs.render(fs.readFileSync("./src/page.ejs", { encoding: "utf8" }), config)
  );

});

app.get("/site.css", (req, res) => {
  res.sendFile(path.resolve("./src/site.css"));
});


app.listen(config.port, () => {
  console.log(`Server started on ${config.port}`);
});
