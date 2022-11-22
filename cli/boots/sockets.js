var Imports = class {
  a = "./configProfiles.js";
  b = "./httpControllers.js";
  c = "./socketsControllers.js";
  d = "./libs.js";
  e = "./models.js";
  get configProfiles() {
    const e = require(this.a), r = {};
    return Object.keys(e).forEach((s) => r[s] = e[s]), r;
  }
  get httpControllers() {
    const e = require(this.b), r = {};
    return Object.keys(e).forEach((s) => r[s] = e[s]), r;
  }
  get socketsControllers() {
    const e = require(this.c), r = {};
    return Object.keys(e).forEach((s) => r[s] = e[s]), r;
  }
  get libs() {
    const e = require(this.d), r = {};
    return Object.keys(e).forEach((s) => r[s] = e[s]), r;
  }
  get models() {
    const e = require(this.e), r = {};
    return Object.keys(e).forEach((s) => r[s] = e[s]), r;
  }
};
var imports = new Imports();
var import_core = require("bitis/core");
var import_web_sockets = require("bitis/web-sockets");
var { configProfiles, socketsControllers, libs, models } = imports;
var configManager = new import_core.ConfigManager(configProfiles);
var libraryManager = new import_core.LibraryManager(configManager, libs);
var modelManager = new import_core.ModelManager(models, libraryManager);
var bitisSocketsConfig = configManager.getConfig("bitisSocketsConfig");
(0, import_web_sockets.initSocketsServer)({ modelManager, libraryManager, socketsControllers, bitisSocketsConfig });
