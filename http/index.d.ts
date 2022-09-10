import * as express from 'express'
import * as http from 'http'
import { ModelsManager } from '../core'
export type ResponseError = {
  code?: string
  message: string
  stack?: string
}
export type ErrorMiddleware = (error?: ResponseError, req?: Request, res?: Response, next?: Next) => void
export type Middleware = (req?: Request, res?: Response, next?: Next) => void
/**
 * Options to set a route.
 */
export type MethodOptions = {
  /**
   * Route.
   */
  path: string;
  /**
   * List of middleware to be called before calling a method.
   */
  beforeMiddlewares?: Array<string | Middleware | ErrorMiddleware>;
  /**
   * List of middleware to be called after calling a method.
   */
  afterMiddlewares?: Array<string | Middleware | ErrorMiddleware>;
}
export enum Methods {
  GET = 'get',
  POST = 'post',
  PUT = 'put',
  DELETE = 'delete'
}
export function On(method: Methods, path: string): (target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => TypedPropertyDescriptor<any>
export function On(methods: Methods[], path: string): (target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => TypedPropertyDescriptor<any>
export function On(method: Methods, options: MethodOptions): (target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => TypedPropertyDescriptor<any>
export function On(methods: Methods[], options: MethodOptions): (target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => TypedPropertyDescriptor<any>
export function Prefix(prefix: string): <T extends new (...args: any[]) => {}>(constructor: T) => {
  new(...args: any[]): { prefix: string; };
} & T
export type OptionsUrlencoded = {
  /** When set to true, then deflated (compressed) bodies will be inflated; when false, deflated bodies are rejected. Defaults to true. */
  inflate?: boolean | undefined;
  /**
   * Controls the maximum request body size. If this is a number,
   * then the value specifies the number of bytes; if it is a string,
   * the value is passed to the bytes library for parsing. Defaults to '100kb'.
   */
  limit?: number | string | undefined;
  /**
   * The type option is used to determine what media type the middleware will parse
   */
  type?: string | string[] | ((req: http.IncomingMessage) => any) | undefined;
  /**
   * The verify option, if supplied, is called as verify(req, res, buf, encoding),
   * where buf is a Buffer of the raw request body and encoding is the encoding of the request.
   */
  verify?(req: http.IncomingMessage, res: http.ServerResponse, buf: Buffer, encoding: string): void;
  /**
   * The extended option allows to choose between parsing the URL-encoded data
   * with the querystring library (when `false`) or the qs library (when `true`).
   */
  extended?: boolean | undefined;
  /**
   * The parameterLimit option controls the maximum number of parameters
   * that are allowed in the URL-encoded data. If a request contains more parameters than this value,
   * a 413 will be returned to the client. Defaults to 1000.
   */
  parameterLimit?: number | undefined;
}
export type EngineTemplates = {
  name: string;
  dirViews: string;
  ext: string;
  callback: (path: string, options: object, callback: (e: any, rendered?: string) => void) => void;
}
/**
 * List of public routes.
 */
export type PathPublic = {
  /**
   * Route.
   * @type {string}
   */
  route: string;
  /**
   * Directory.
   * @type {string}
   */
  dir: string;
}
/**
 * Options for development.
 */
export type Dev = {
  /**
   * Indicates whether the server will print the external IP (LAN) on the terminal.
   */
  showExternalIp: boolean;
  /**
   * Name of the network interface.
   */
  interfaceNetwork: string;
}
/**
 * Bitis HTTP configuration profile.
 */
export type BitisHTTPConfigProfile = {
  middlewares?: any[]
  /**
   * Configuration for body parser.
   */
  optionsUrlencoded?: OptionsUrlencoded;
  /**
   * Set up a templating engine.
   */
  engineTemplates?: EngineTemplates;
  /**
   * Events of Gorila HTTP.
   */
  events?: {
    onError: (error: Error, request: Request, response: Response, next: Next) => void
    /**
     * Called before the express.js instance is configured.
     */
    beforeConfig?: (app: express.Express) => void;
    /**
     * Called after the express.js instance is configured.
     */
    afterConfig?: (app: express.Express) => void;
    /**
     * Called after the server starts.
     */
    beforeStarting?: (app: express.Express) => void;
  };
  pathsPublic?: PathPublic[];
  dev?: Dev;
  /**
   * Port the server is listening on.
   * @type {number}
   */
  port?: number;
}
export type OptionsHttpServer = {
  returnInstance?: boolean
  mm: ModelsManager
  distDir: string
  mainDir: string
  bitisHttpConfig: BitisHTTPConfigProfile
  onMessage?: (message: string) => void
}
export function initHttpServer(options: OptionsHttpServer): http.Server | undefined
/**
 * The object of an express.js response.
 */
export declare type Response = express.Response;
/**
 * The object of an express.js request.
 */
export declare type Request = express.Request;
export declare type Next = express.NextFunction;