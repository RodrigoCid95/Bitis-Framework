module.exports.On = function On(nameEvent) {
  return (target, propertyKey, descriptor) => {
    if (!target.hasOwnProperty('routes')) {
      target.routes = [];
    }
    target.routes.push({ nameEvent, propertyKey });
    return descriptor;
  };
};
module.exports.Prefix = function Prefix(prefix) {
  return function (constructor) {
    return class extends constructor {
      prefix = prefix;
    };
  };
};
module.exports.initSocketsServer = function initSocketsServer({ http, mm, lm, distDir, BitisSocketsConfig = {}, onError = console.error }) {
  const path = require('path');
  const SocketIO = require('socket.io');
  let io = null;
  const {
    port = process.env.PORT ? parseInt(process.env.PORT) : 80,
    events = {}
  } = BitisSocketsConfig;
  if (http) {
    io = new SocketIO.Server(http, BitisSocketsConfig);
  } else {
    io = SocketIO(port, BitisSocketsConfig);
  }
  if (events.onBeforeConfig) {
    io = events.onBeforeConfig(io);
  }
  const socketsControllersPath = path.join(distDir, 'socketsControllers');
  const socketsControllersClasses = require(socketsControllersPath);
  const sRoutes = [];
  for (const nameClass in socketsControllersClasses) {
    const socketsControllersClass = socketsControllersClasses[nameClass];
    if (socketsControllersClass.prototype.routes) {
      const routes = socketsControllersClass.prototype.routes;
      delete socketsControllersClass.prototype.routes;
      let models = [];
      if (socketsControllersClass.prototype.models) {
        models = socketsControllersClass.prototype.models.map(({ propertyMod, model }) => ({
          propertyMod,
          model: mm.getModel(model)
        }));
        delete socketsControllersClass.prototype.models;
      }
      socketsControllersClass.prototype['io'] = io;
      for (const { propertyMod, model } of models) {
        socketsControllersClass.prototype[propertyMod] = model;
      }
      const instanceSocketsController = new socketsControllersClass();
      let prefix = '';
      if (instanceSocketsController.prefix) {
        prefix = instanceSocketsController.prefix;
        delete instanceSocketsController.prefix;
      }
      for (let { nameEvent, propertyKey } of routes) {
        nameEvent = prefix !== '' ? `${prefix} ${nameEvent}` : nameEvent;
        sRoutes.push({
          nameEvent,
          callback: instanceSocketsController[propertyKey].bind(instanceSocketsController)
        });
      }
    }
  }
  io.on('connect', socket => {
    if (events.onConnect) {
      events.onConnect(socket)
    }
    for (const { nameEvent, callback } of sRoutes) {
      socket.on(nameEvent, (...args) => {
        const end = args.find(arg => typeof arg === 'function');
        let argmnts = args.filter(arg => typeof arg !== 'function');
        const { getLibrary } = lm;
        try {
          if (events.onANewRequest) {
            argmnts = events.onANewRequest(argmnts, socket, getLibrary.bind(lm));
          }
          argmnts.push(socket);
          let contentReturn = callback(...argmnts);
          if (contentReturn instanceof Promise) {
            contentReturn.then((response) => {
              if (events.onBeforeToAnswer) {
                response = events.onBeforeToAnswer(response, socket, getLibrary.bind(lm));
              }
              if (end) {
                end(response);
              }
            }).catch(error => {
              error = {
                ...error,
                error: true,
                level: error.code != undefined ? 1 : 0,
                code: error.code != undefined ? error.code : 0,
                message: error.message != undefined ? error.message : error
              };
              if (end) {
                end(end);
              }
              onError(JSON.stringify(end));
            });
          } else {
            if (events.onBeforeToAnswer) {
              contentReturn = events.onBeforeToAnswer(contentReturn, socket, getLibrary.bind(lm));
            }
            if (end) {
              end(contentReturn);
            }
          }
        } catch (error) {
          error = {
            ...error,
            error: true,
            level: 0,
            code: error.code !== undefined ? error.code : 0,
            message: error.message !== undefined ? error.message : error,
            stack: error.stack
          };
          onError(JSON.stringify(end));
          if (events.onBeforeToAnswer) {
            error = events.onBeforeToAnswer(error, socket, getLibrary);
          }
          if (end) {
            end(contentReturn);
          }
        }
      });
    }
  });
};
