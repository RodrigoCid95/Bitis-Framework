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
  get socketControllers() {
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
var import_http = require("bitis/http");
var { configProfiles, httpControllers, libs, models } = imports;
var configManager = new import_core.ConfigManager(configProfiles);
var libraryManager = new import_core.LibraryManager(configManager, libs);
var modelManager = new import_core.ModelManager(models, libraryManager);
var bitisHttpConfig = configManager.getConfig("bitisHttpConfig");
(0, import_http.initHttpServer)({ modelManager, httpControllers, bitisHttpConfig });
