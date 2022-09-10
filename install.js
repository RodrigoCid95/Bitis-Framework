#!/usr/bin/env node
const path = require('path');
const fs = require('fs');
const dirBase = process.env.npm_config_local_prefix;
const packDir = path.join(dirBase, 'package.json')
const pack = require(packDir)
let config = {
  type: 'http',
  boot: 'auto',
  'public-paths': []
}
if (pack.hasOwnProperty('bitis')) {
  config = pack.bitis
} else {
  pack.bitis = config
}
if (!pack.hasOwnProperty('scripts')) {
  pack.scripts = {}
}
if (!pack.scripts.hasOwnProperty('start')) {
  pack.scripts.start = 'bitis start'
}
if (!pack.scripts.hasOwnProperty('build')) {
  pack.scripts.build = 'bitis build'
}
fs.writeFileSync(packDir, JSON.stringify(pack, null, '\t'), { encoding: 'utf-8' })
const srcDir = path.join(dirBase)
if (!fs.existsSync(srcDir)) {
  fs.mkdirSync(srcDir, { recursive: true, force: true })
}
const dirList = [
  path.join(srcDir, 'config', 'index.ts'),
  path.join(srcDir, 'libraries', 'index.ts'),
  path.join(srcDir, 'models', 'index.ts')
]
if (config.boot === 'manual') {
  dirList.push(path.join(srcDir, 'main.ts'))
}
if (config.type === 'http' || config.type === 'http-sockets') {
  dirList.push(path.join(srcDir, 'controllers', 'http.ts'))
}
if (config.type === 'sockets' || config.type === 'http-sockets') {
  dirList.push(path.join(srcDir, 'controllers', 'sockets.ts'))
}
for (const dir of dirList) {
  if (!fs.existsSync(dir)) {
    const configDir = path.resolve(dir, '..')
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir)
    }
    fs.writeFileSync(dir, '', { recusive: true, force: true })
  }
}
const tsconfigPath = path.join(dirBase, 'tsconfig.json')
if (!fs.existsSync(tsconfigPath)) {
  const tsconfig = {
    compilerOptions: {
      baseUrl: ".",
      declaration: true,
      emitDeclarationOnly: true,
      experimentalDecorators: true,
      emitDecoratorMetadata: true,
      target: "ES6",
      moduleResolution: "Node",
      sourceMap: true,
      strictNullChecks: true,
      paths: {
        "config/*": ["config/*"],
        "controllers": ["controllers/*"],
        "libraries/*": ["libraries/*"],
        "models/*": ["models/*"]
      }
    }
  }
  fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, '\t'), { encoding: 'utf-8' })
}
