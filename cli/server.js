#!/usr/bin/env node
'use strict';
(async function () {
  //#region Declarations
  
  const path = require('path')
  const { Flags, ConfigManager, LibraryManager, ModelsManager } = require('./../core')
  const flags = new Flags()
  const mainDir = flags.get('mainDir')
  const distDir = flags.get('distDir')
  const configPath = path.join(distDir, 'configProfiles')
  const cm = new ConfigManager(require(configPath).default)
  const typeServer = flags.get('type')

  //#endregion
  //#region Libraries

  const initsPath = path.join(distDir, 'libs')
  const inits = require(initsPath)
  const lm = new LibraryManager(cm, inits)
  await lm.build(message => process.send(message))

  //#endregion
  //#region Models

  const modelsPath = path.join(distDir, 'models')
  const modelClasses = require(modelsPath)
  const mm = new ModelsManager(modelClasses, lm)

  //#endregion
  //#region Server

  if (typeServer === 'http') {
    const { initHttpServer } = require('./../http')
    initHttpServer({
      returnInstance: false,
      mm,
      distDir,
      mainDir,
      bitisHttpConfig: cm.getConfig('bitisHttpConfig'),
      onMessage: message => process.send(message)
    })
  } else if (typeServer === 'sockets') {
    const { initSocketsServer } = require('./../web-sockets')
    initSocketsServer({
      mm,
      lm,
      distDir,
      bitisSocketsConfig: cm.getConfig('bitisSocketsConfig'),
      onError: error => process.send(error)
    })
  } else if (typeServer === 'http-sockets') {
    const { initHttpServer } = require('./../http')
    const http = initHttpServer({
      returnInstance: true,
      mm,
      distDir,
      mainDir,
      bitisHttpConfig: cm.getConfig('bitisHttpConfig'),
      onMessage: message => process.send(message)
    })
    const { initSocketsServer } = require('./../web-sockets')
    initSocketsServer({
      http,
      mm,
      lm,
      distDir,
      bitisSocketsConfig: cm.getConfig('bitisSocketsConfig'),
      onError: error => process.send(error)
    })
  } else {
    let message = ''
    if (typeServer === undefined || typeServer === 'undefined') {
      message = 'El valor de "type" no está definido, intenta con http, sockets o http-sockets'
    } else {
      message = 'El valor de "type" no es válido, intenta con http, sockets o http-sockets'
    }
    process.send(message)
  }

  //#endregion
})()
