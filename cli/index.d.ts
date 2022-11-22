import { AnyObject, AnyClass, InitLibraries, ModelClasses } from '../core'

export class Imports {
  readonly configProfiles: AnyObject
  readonly httpControllers: AnyClass
  readonly socketsControllers: AnyClass
  readonly libs: InitLibraries
  readonly models: ModelClasses
}
