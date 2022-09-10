/**
 * Any object.
 */
export type AnyObject = {
  [i: string]: any
}
/**
 * Configuration loader.
 * @class
 */
export class ConfigManager {
  /**
   * Constructor
   * @param {Object} profiles Object with configuration profiles.
   */
  constructor(profiles: AnyObject)
  /**
   * getConfig
   * @description Search for a configuration profile
   * @param {string} name Name of the configuration profile.
   * @returns {any} Returns a configuration profile.
   */
  public getConfig<T = any>(nameConfig: string): T
}
/**
 * This class catches the arguments declared on the command line and converts them to manageable variables.
 * @class
 */
export class Flags {
  /**
   * Look for a convert argument from the command line.
   * @param {string} name Argument name.
   * @returns Returns the value of a variable.
   */
  get<T = any>(nameFlag: string): T
}
export type InitLibrary<P = {}, R = any> = (profile: P) => R | Promise<R>
export type InitLibraries = {
  [name: string]: InitLibrary
}
/**
 * Library manager.
 * @class
 */
export class LibraryManager {
  /**
   * Indicates if all libraries have been compiled / configured.
   * @property
   */
  public isCompiled: boolean
  /**
   * Constructor.
   * @param {ConfigManager} loaderConfig Configuration loader instance.
   * @param {InitLibraries} libraries List of library declarations.
   */
  constructor(configManager: ConfigManager, libraries: InitLibraries)
  /**
   * Method that compiles / configures the libraries declared in the constructor.
   * @function
   * @returns {Promise<void>} Returns a promise that is resolved when all libraries declared in the constructor are compiled / configured.
   */
  public build(log: (message: string) => void): Promise<void>
  /**
   * Find the instance of a library.
   * @param {string} name Name of the library.
   * @returns Returns the library instance with the name of the name parameter.
   */
  public getLibrary<P = any>(name: string): P
}
export function Lib(nameLibrary: string): (target: Object, propertyKey: string) => void
export type AnyClass = {
  new()
}
export function Model(model: string): (target: Object, propertyKey: string) => void
export type Models = AnyClass[]
export type ModelClasses = {
  [name: string]: AnyClass
}
export class ModelsManager {
  constructor(modelClasses: ModelClasses, lm: LibraryManager)
  public getModel<M = AnyClass>(name: string): M
}