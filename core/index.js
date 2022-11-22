module.exports.ConfigManager = class ConfigManager {
  constructor(profiles = {}) {
    const _this = this
    _this.profiles = {}
    Object.keys(profiles).forEach(key => _this.profiles[key] = profiles[key])
  }
  getConfig(name) {
    return this.profiles[name] || {}
  }
}
module.exports.Flags = class Flags {
  /**
   * Constructor.
   */
  constructor() {
    const argList = process.argv
    this.args = {}
    let a
    let opt
    let thisOpt
    let curOpt
    for (a = 0; a < argList.length; a++) {
      thisOpt = argList[a].trim()
      opt = thisOpt.replace(/^\-+/, '')
      if (opt === thisOpt) {
        if (curOpt) this.args[curOpt] = opt
        curOpt = null
      } else {
        curOpt = opt
        this.args[curOpt] = true
      }
    }
  }
  /**
   * Look for a convert argument from the command line.
   * @param {string} name Argument name.
   * @returns {string | boolean} Returns the value of a variable.
   */
  get(name) {
    return this.args[name]
  }
}
module.exports.Lib = function Lib(nameLib) {
  return (target, propertyKey) => {
    if (!target.hasOwnProperty('libs')) {
      target.libs = []
    }
    target.libs.push({
      propertyLib: propertyKey,
      nameLib
    })
  }
}
module.exports.LibraryManager = class LibraryManager {
  constructor(configManager, libraries) {
    this.configManager = configManager
    this.libraries = libraries
    this.librariesInstances = {}
  }
  async build(log = undefined) {
    const nameLibs = Object.keys(this.libraries)
    for (const name of nameLibs) {
      if (log) {
        log(`Iniciando librería ${name}...`)
      }
      const library = this.libraries[name]
      let contentReturn = library(this.configManager.getConfig(name))
      try {
        if (contentReturn instanceof Promise) {
          this.librariesInstances[name] = await contentReturn
        } else {
          this.librariesInstances[name] = contentReturn
        }
      } catch (error) {
        throw new Error(`Error al cargar la librería ${name}`)
      }
      if (log) {
        log(`Librería ${name} lista!`)
      }
    }
    this.isCompiled = true
  }
  getLibrary(name) {
    return this.librariesInstances[name]
  }
}
module.exports.Model = function Model(model) {
  return (target, propertyKey) => {
    if (!target.hasOwnProperty('models')) {
      target.models = []
    }
    target.models.push({
      propertyMod: propertyKey,
      model
    })
  }
}
module.exports.ModelManager = class ModelsManager {
  constructor(modelClasses, lm) {
    this.instances = {}
    for (const nameClass in modelClasses) {
      const modelClass = modelClasses[nameClass]
      let libs = []
      if (modelClass.prototype.libs) {
        libs = modelClass.prototype.libs.map(({ propertyLib, nameLib }) => ({
          propertyLib,
          lib: lm.getLibrary(nameLib)
        }))
        delete modelClass.prototype.libs
      }
      for (const { propertyLib, lib } of libs) {
        modelClass.prototype[propertyLib] = lib
      }
      const instanceModel = new modelClass()
      this.instances[nameClass] = instanceModel
    }
  }
  getModel(name) {
    return this.instances[name]
  }
}
