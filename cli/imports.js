class Imports{a="./configProfiles.js";b="./httpControllers.js";c="./socketsControllers.js";d="./libs.js";e="./models.js";get configProfiles(){const e=require(this.a),r={};return Object.keys(e).forEach((s=>r[s]=e[s])),r}get httpControllers(){const e=require(this.b),r={};return Object.keys(e).forEach((s=>r[s]=e[s])),r}get socketsControllers(){const e=require(this.c),r={};return Object.keys(e).forEach((s=>r[s]=e[s])),r}get libs(){const e=require(this.d),r={};return Object.keys(e).forEach((s=>r[s]=e[s])),r}get models(){const e=require(this.e),r={};return Object.keys(e).forEach((s=>r[s]=e[s])),r}}
export const imports = new Imports()
