import { AnyClass, LibraryManager, ModelManager } from './../core'
import * as SocketIO from 'socket.io'
import * as http from 'http'
/**
 * Register a new handler for the given event.
 * @param {string} nameEvent Name of the event
 * @returns {void}
 */
export function On(nameEvent: string): (target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => TypedPropertyDescriptor<any>
/**
 * Structure of an error response.
 */
export interface ResponseError {
  /**
   * Level where the error occurred, if it is 0 the error was produced from the internal layer of the library, but if it is 1 the error is in the code layer of the controller.
   */
  level?: number
  /**
   * Error code.
   */
  code: number | string
  /**
   * Error message.
   */
  message: string
  /**
   * Call stack.
   */
  stack?: any
  [x: string]: any
}
/**
 * Structure of an response.
 */
export interface SocketResponse {
  /**
   * Response data.
   * @type {any}
   */
  data?: any
  /**
   * Response error.
   * @type {ResponseError}
   */
  error?: ResponseError
}
/**
 * Web socket.
 */
export type Socket = SocketIO.Socket
/**
 * Config sockets server.
 */
export interface BitisSocketsConfig extends Partial<SocketIO.ServerOptions> {
  /**
  * Port the server is listening on.
  * @type {number}
  */
  port?: number
  /**
   * Events.
   */
  events?: {
    onBeforeConfig?: (io: SocketIO.Server) => SocketIO.Server
    /**
     * Called when a new connection is created.
     */
    onConnect?: (socket: Socket) => void
    /**
     * Called before returning a response to the client.
     */
    onBeforeToAnswer?: (response: SocketResponse | ResponseError, socket: Socket, getLibraryInstance: LibraryManager['getLibrary']) => SocketResponse | ResponseError
    /**
     * Called when a call is made by the customer.
     */
    onANewRequest?: (request: any[], socket: Socket, getLibraryInstance: LibraryManager['getLibrary']) => any[]
    /**
     * Called when a client disconnects.
     */
    onDisconnect?: (reason: string, socket: Socket) => void
  }
}
/**
 * SocketIO server.
 */
export type IO = SocketIO.Server
export function Prefix(prefix: string): <T extends new (...args: any[]) => {}>(constructor: T) => {
  new(...args: any[]): { prefix: string; };
} & T
export type OptionsSocketsServer = {
  http?: http.Server
  modelManager: ModelManager
  libraryManager: LibraryManager
  socketsControllers: AnyClass
  bitisSocketsConfig?: BitisSocketsConfig
  onError?: (error: any) => void
}
export function initSocketsServer(options: OptionsSocketsServer): void