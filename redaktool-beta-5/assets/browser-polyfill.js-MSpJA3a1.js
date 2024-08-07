var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var require_browser_polyfill_js_008 = __commonJS({
  "assets/browser-polyfill.js-MSpJA3a1.js"(exports, module) {
    (function(global, factory) {
      if (typeof define === "function" && define.amd) {
        define("webextension-polyfill", ["module"], factory);
      } else if (typeof exports !== "undefined") {
        factory(module);
      } else {
        var mod = {
          exports: {}
        };
        factory(mod);
        global.browser = mod.exports;
      }
    })(
      typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : void 0,
      function(module2) {
        var _a, _b;
        if (!((_b = (_a = globalThis.chrome) == null ? void 0 : _a.runtime) == null ? void 0 : _b.id)) {
          throw new Error(
            "This script should only be loaded in a browser extension."
          );
        }
        if (typeof globalThis.browser === "undefined" || Object.getPrototypeOf(globalThis.browser) !== Object.prototype) {
          const CHROME_SEND_MESSAGE_CALLBACK_NO_RESPONSE_MESSAGE = "The message port closed before a response was received.";
          const wrapAPIs = (extensionAPIs) => {
            const apiMetadata = {
              alarms: {
                clear: {
                  minArgs: 0,
                  maxArgs: 1
                },
                clearAll: {
                  minArgs: 0,
                  maxArgs: 0
                },
                get: {
                  minArgs: 0,
                  maxArgs: 1
                },
                getAll: {
                  minArgs: 0,
                  maxArgs: 0
                }
              },
              bookmarks: {
                create: {
                  minArgs: 1,
                  maxArgs: 1
                },
                get: {
                  minArgs: 1,
                  maxArgs: 1
                },
                getChildren: {
                  minArgs: 1,
                  maxArgs: 1
                },
                getRecent: {
                  minArgs: 1,
                  maxArgs: 1
                },
                getSubTree: {
                  minArgs: 1,
                  maxArgs: 1
                },
                getTree: {
                  minArgs: 0,
                  maxArgs: 0
                },
                move: {
                  minArgs: 2,
                  maxArgs: 2
                },
                remove: {
                  minArgs: 1,
                  maxArgs: 1
                },
                removeTree: {
                  minArgs: 1,
                  maxArgs: 1
                },
                search: {
                  minArgs: 1,
                  maxArgs: 1
                },
                update: {
                  minArgs: 2,
                  maxArgs: 2
                }
              },
              browserAction: {
                disable: {
                  minArgs: 0,
                  maxArgs: 1,
                  fallbackToNoCallback: true
                },
                enable: {
                  minArgs: 0,
                  maxArgs: 1,
                  fallbackToNoCallback: true
                },
                getBadgeBackgroundColor: {
                  minArgs: 1,
                  maxArgs: 1
                },
                getBadgeText: {
                  minArgs: 1,
                  maxArgs: 1
                },
                getPopup: {
                  minArgs: 1,
                  maxArgs: 1
                },
                getTitle: {
                  minArgs: 1,
                  maxArgs: 1
                },
                openPopup: {
                  minArgs: 0,
                  maxArgs: 0
                },
                setBadgeBackgroundColor: {
                  minArgs: 1,
                  maxArgs: 1,
                  fallbackToNoCallback: true
                },
                setBadgeText: {
                  minArgs: 1,
                  maxArgs: 1,
                  fallbackToNoCallback: true
                },
                setIcon: {
                  minArgs: 1,
                  maxArgs: 1
                },
                setPopup: {
                  minArgs: 1,
                  maxArgs: 1,
                  fallbackToNoCallback: true
                },
                setTitle: {
                  minArgs: 1,
                  maxArgs: 1,
                  fallbackToNoCallback: true
                }
              },
              browsingData: {
                remove: {
                  minArgs: 2,
                  maxArgs: 2
                },
                removeCache: {
                  minArgs: 1,
                  maxArgs: 1
                },
                removeCookies: {
                  minArgs: 1,
                  maxArgs: 1
                },
                removeDownloads: {
                  minArgs: 1,
                  maxArgs: 1
                },
                removeFormData: {
                  minArgs: 1,
                  maxArgs: 1
                },
                removeHistory: {
                  minArgs: 1,
                  maxArgs: 1
                },
                removeLocalStorage: {
                  minArgs: 1,
                  maxArgs: 1
                },
                removePasswords: {
                  minArgs: 1,
                  maxArgs: 1
                },
                removePluginData: {
                  minArgs: 1,
                  maxArgs: 1
                },
                settings: {
                  minArgs: 0,
                  maxArgs: 0
                }
              },
              commands: {
                getAll: {
                  minArgs: 0,
                  maxArgs: 0
                }
              },
              contextMenus: {
                remove: {
                  minArgs: 1,
                  maxArgs: 1
                },
                removeAll: {
                  minArgs: 0,
                  maxArgs: 0
                },
                update: {
                  minArgs: 2,
                  maxArgs: 2
                }
              },
              cookies: {
                get: {
                  minArgs: 1,
                  maxArgs: 1
                },
                getAll: {
                  minArgs: 1,
                  maxArgs: 1
                },
                getAllCookieStores: {
                  minArgs: 0,
                  maxArgs: 0
                },
                remove: {
                  minArgs: 1,
                  maxArgs: 1
                },
                set: {
                  minArgs: 1,
                  maxArgs: 1
                }
              },
              devtools: {
                inspectedWindow: {
                  eval: {
                    minArgs: 1,
                    maxArgs: 2,
                    singleCallbackArg: false
                  }
                },
                panels: {
                  create: {
                    minArgs: 3,
                    maxArgs: 3,
                    singleCallbackArg: true
                  },
                  elements: {
                    createSidebarPane: {
                      minArgs: 1,
                      maxArgs: 1
                    }
                  }
                }
              },
              downloads: {
                cancel: {
                  minArgs: 1,
                  maxArgs: 1
                },
                download: {
                  minArgs: 1,
                  maxArgs: 1
                },
                erase: {
                  minArgs: 1,
                  maxArgs: 1
                },
                getFileIcon: {
                  minArgs: 1,
                  maxArgs: 2
                },
                open: {
                  minArgs: 1,
                  maxArgs: 1,
                  fallbackToNoCallback: true
                },
                pause: {
                  minArgs: 1,
                  maxArgs: 1
                },
                removeFile: {
                  minArgs: 1,
                  maxArgs: 1
                },
                resume: {
                  minArgs: 1,
                  maxArgs: 1
                },
                search: {
                  minArgs: 1,
                  maxArgs: 1
                },
                show: {
                  minArgs: 1,
                  maxArgs: 1,
                  fallbackToNoCallback: true
                }
              },
              extension: {
                isAllowedFileSchemeAccess: {
                  minArgs: 0,
                  maxArgs: 0
                },
                isAllowedIncognitoAccess: {
                  minArgs: 0,
                  maxArgs: 0
                }
              },
              history: {
                addUrl: {
                  minArgs: 1,
                  maxArgs: 1
                },
                deleteAll: {
                  minArgs: 0,
                  maxArgs: 0
                },
                deleteRange: {
                  minArgs: 1,
                  maxArgs: 1
                },
                deleteUrl: {
                  minArgs: 1,
                  maxArgs: 1
                },
                getVisits: {
                  minArgs: 1,
                  maxArgs: 1
                },
                search: {
                  minArgs: 1,
                  maxArgs: 1
                }
              },
              i18n: {
                detectLanguage: {
                  minArgs: 1,
                  maxArgs: 1
                },
                getAcceptLanguages: {
                  minArgs: 0,
                  maxArgs: 0
                }
              },
              identity: {
                launchWebAuthFlow: {
                  minArgs: 1,
                  maxArgs: 1
                }
              },
              idle: {
                queryState: {
                  minArgs: 1,
                  maxArgs: 1
                }
              },
              management: {
                get: {
                  minArgs: 1,
                  maxArgs: 1
                },
                getAll: {
                  minArgs: 0,
                  maxArgs: 0
                },
                getSelf: {
                  minArgs: 0,
                  maxArgs: 0
                },
                setEnabled: {
                  minArgs: 2,
                  maxArgs: 2
                },
                uninstallSelf: {
                  minArgs: 0,
                  maxArgs: 1
                }
              },
              notifications: {
                clear: {
                  minArgs: 1,
                  maxArgs: 1
                },
                create: {
                  minArgs: 1,
                  maxArgs: 2
                },
                getAll: {
                  minArgs: 0,
                  maxArgs: 0
                },
                getPermissionLevel: {
                  minArgs: 0,
                  maxArgs: 0
                },
                update: {
                  minArgs: 2,
                  maxArgs: 2
                }
              },
              pageAction: {
                getPopup: {
                  minArgs: 1,
                  maxArgs: 1
                },
                getTitle: {
                  minArgs: 1,
                  maxArgs: 1
                },
                hide: {
                  minArgs: 1,
                  maxArgs: 1,
                  fallbackToNoCallback: true
                },
                setIcon: {
                  minArgs: 1,
                  maxArgs: 1
                },
                setPopup: {
                  minArgs: 1,
                  maxArgs: 1,
                  fallbackToNoCallback: true
                },
                setTitle: {
                  minArgs: 1,
                  maxArgs: 1,
                  fallbackToNoCallback: true
                },
                show: {
                  minArgs: 1,
                  maxArgs: 1,
                  fallbackToNoCallback: true
                }
              },
              permissions: {
                contains: {
                  minArgs: 1,
                  maxArgs: 1
                },
                getAll: {
                  minArgs: 0,
                  maxArgs: 0
                },
                remove: {
                  minArgs: 1,
                  maxArgs: 1
                },
                request: {
                  minArgs: 1,
                  maxArgs: 1
                }
              },
              runtime: {
                getBackgroundPage: {
                  minArgs: 0,
                  maxArgs: 0
                },
                getPlatformInfo: {
                  minArgs: 0,
                  maxArgs: 0
                },
                openOptionsPage: {
                  minArgs: 0,
                  maxArgs: 0
                },
                requestUpdateCheck: {
                  minArgs: 0,
                  maxArgs: 0
                },
                sendMessage: {
                  minArgs: 1,
                  maxArgs: 3
                },
                sendNativeMessage: {
                  minArgs: 2,
                  maxArgs: 2
                },
                setUninstallURL: {
                  minArgs: 1,
                  maxArgs: 1
                }
              },
              sessions: {
                getDevices: {
                  minArgs: 0,
                  maxArgs: 1
                },
                getRecentlyClosed: {
                  minArgs: 0,
                  maxArgs: 1
                },
                restore: {
                  minArgs: 0,
                  maxArgs: 1
                }
              },
              storage: {
                local: {
                  clear: {
                    minArgs: 0,
                    maxArgs: 0
                  },
                  get: {
                    minArgs: 0,
                    maxArgs: 1
                  },
                  getBytesInUse: {
                    minArgs: 0,
                    maxArgs: 1
                  },
                  remove: {
                    minArgs: 1,
                    maxArgs: 1
                  },
                  set: {
                    minArgs: 1,
                    maxArgs: 1
                  }
                },
                managed: {
                  get: {
                    minArgs: 0,
                    maxArgs: 1
                  },
                  getBytesInUse: {
                    minArgs: 0,
                    maxArgs: 1
                  }
                },
                sync: {
                  clear: {
                    minArgs: 0,
                    maxArgs: 0
                  },
                  get: {
                    minArgs: 0,
                    maxArgs: 1
                  },
                  getBytesInUse: {
                    minArgs: 0,
                    maxArgs: 1
                  },
                  remove: {
                    minArgs: 1,
                    maxArgs: 1
                  },
                  set: {
                    minArgs: 1,
                    maxArgs: 1
                  }
                }
              },
              tabs: {
                captureVisibleTab: {
                  minArgs: 0,
                  maxArgs: 2
                },
                create: {
                  minArgs: 1,
                  maxArgs: 1
                },
                detectLanguage: {
                  minArgs: 0,
                  maxArgs: 1
                },
                discard: {
                  minArgs: 0,
                  maxArgs: 1
                },
                duplicate: {
                  minArgs: 1,
                  maxArgs: 1
                },
                executeScript: {
                  minArgs: 1,
                  maxArgs: 2
                },
                get: {
                  minArgs: 1,
                  maxArgs: 1
                },
                getCurrent: {
                  minArgs: 0,
                  maxArgs: 0
                },
                getZoom: {
                  minArgs: 0,
                  maxArgs: 1
                },
                getZoomSettings: {
                  minArgs: 0,
                  maxArgs: 1
                },
                goBack: {
                  minArgs: 0,
                  maxArgs: 1
                },
                goForward: {
                  minArgs: 0,
                  maxArgs: 1
                },
                highlight: {
                  minArgs: 1,
                  maxArgs: 1
                },
                insertCSS: {
                  minArgs: 1,
                  maxArgs: 2
                },
                move: {
                  minArgs: 2,
                  maxArgs: 2
                },
                query: {
                  minArgs: 1,
                  maxArgs: 1
                },
                reload: {
                  minArgs: 0,
                  maxArgs: 2
                },
                remove: {
                  minArgs: 1,
                  maxArgs: 1
                },
                removeCSS: {
                  minArgs: 1,
                  maxArgs: 2
                },
                sendMessage: {
                  minArgs: 2,
                  maxArgs: 3
                },
                setZoom: {
                  minArgs: 1,
                  maxArgs: 2
                },
                setZoomSettings: {
                  minArgs: 1,
                  maxArgs: 2
                },
                update: {
                  minArgs: 1,
                  maxArgs: 2
                }
              },
              topSites: {
                get: {
                  minArgs: 0,
                  maxArgs: 0
                }
              },
              webNavigation: {
                getAllFrames: {
                  minArgs: 1,
                  maxArgs: 1
                },
                getFrame: {
                  minArgs: 1,
                  maxArgs: 1
                }
              },
              webRequest: {
                handlerBehaviorChanged: {
                  minArgs: 0,
                  maxArgs: 0
                }
              },
              windows: {
                create: {
                  minArgs: 0,
                  maxArgs: 1
                },
                get: {
                  minArgs: 1,
                  maxArgs: 2
                },
                getAll: {
                  minArgs: 0,
                  maxArgs: 1
                },
                getCurrent: {
                  minArgs: 0,
                  maxArgs: 1
                },
                getLastFocused: {
                  minArgs: 0,
                  maxArgs: 1
                },
                remove: {
                  minArgs: 1,
                  maxArgs: 1
                },
                update: {
                  minArgs: 2,
                  maxArgs: 2
                }
              }
            };
            if (Object.keys(apiMetadata).length === 0) {
              throw new Error(
                "api-metadata.json has not been included in browser-polyfill"
              );
            }
            class DefaultWeakMap extends WeakMap {
              constructor(createItem, items = void 0) {
                super(items);
                this.createItem = createItem;
              }
              get(key) {
                if (!this.has(key)) {
                  this.set(key, this.createItem(key));
                }
                return super.get(key);
              }
            }
            const isThenable = (value) => {
              return value && typeof value === "object" && typeof value.then === "function";
            };
            const makeCallback = (promise, metadata) => {
              return (...callbackArgs) => {
                if (extensionAPIs.runtime.lastError) {
                  promise.reject(
                    new Error(extensionAPIs.runtime.lastError.message)
                  );
                } else if (metadata.singleCallbackArg || callbackArgs.length <= 1 && metadata.singleCallbackArg !== false) {
                  promise.resolve(callbackArgs[0]);
                } else {
                  promise.resolve(callbackArgs);
                }
              };
            };
            const pluralizeArguments = (numArgs) => numArgs == 1 ? "argument" : "arguments";
            const wrapAsyncFunction = (name, metadata) => {
              return function asyncFunctionWrapper(target, ...args) {
                if (args.length < metadata.minArgs) {
                  throw new Error(
                    `Expected at least ${metadata.minArgs} ${pluralizeArguments(
                      metadata.minArgs
                    )} for ${name}(), got ${args.length}`
                  );
                }
                if (args.length > metadata.maxArgs) {
                  throw new Error(
                    `Expected at most ${metadata.maxArgs} ${pluralizeArguments(
                      metadata.maxArgs
                    )} for ${name}(), got ${args.length}`
                  );
                }
                return new Promise((resolve, reject) => {
                  if (metadata.fallbackToNoCallback) {
                    try {
                      target[name](
                        ...args,
                        makeCallback(
                          {
                            resolve,
                            reject
                          },
                          metadata
                        )
                      );
                    } catch (cbError) {
                      console.warn(
                        `${name} API method doesn't seem to support the callback parameter, falling back to call it without a callback: `,
                        cbError
                      );
                      target[name](...args);
                      metadata.fallbackToNoCallback = false;
                      metadata.noCallback = true;
                      resolve();
                    }
                  } else if (metadata.noCallback) {
                    target[name](...args);
                    resolve();
                  } else {
                    target[name](
                      ...args,
                      makeCallback(
                        {
                          resolve,
                          reject
                        },
                        metadata
                      )
                    );
                  }
                });
              };
            };
            const wrapMethod = (target, method, wrapper) => {
              return new Proxy(method, {
                apply(targetMethod, thisObj, args) {
                  return wrapper.call(thisObj, target, ...args);
                }
              });
            };
            let hasOwnProperty = Function.call.bind(
              Object.prototype.hasOwnProperty
            );
            const wrapObject = (target, wrappers = {}, metadata = {}) => {
              let cache = /* @__PURE__ */ Object.create(null);
              let handlers = {
                has(proxyTarget2, prop) {
                  return prop in target || prop in cache;
                },
                get(proxyTarget2, prop, receiver) {
                  if (prop in cache) {
                    return cache[prop];
                  }
                  if (!(prop in target)) {
                    return void 0;
                  }
                  let value = target[prop];
                  if (typeof value === "function") {
                    if (typeof wrappers[prop] === "function") {
                      value = wrapMethod(target, target[prop], wrappers[prop]);
                    } else if (hasOwnProperty(metadata, prop)) {
                      let wrapper = wrapAsyncFunction(prop, metadata[prop]);
                      value = wrapMethod(target, target[prop], wrapper);
                    } else {
                      value = value.bind(target);
                    }
                  } else if (typeof value === "object" && value !== null && (hasOwnProperty(wrappers, prop) || hasOwnProperty(metadata, prop))) {
                    value = wrapObject(value, wrappers[prop], metadata[prop]);
                  } else if (hasOwnProperty(metadata, "*")) {
                    value = wrapObject(value, wrappers[prop], metadata["*"]);
                  } else {
                    Object.defineProperty(cache, prop, {
                      configurable: true,
                      enumerable: true,
                      get() {
                        return target[prop];
                      },
                      set(value2) {
                        target[prop] = value2;
                      }
                    });
                    return value;
                  }
                  cache[prop] = value;
                  return value;
                },
                set(proxyTarget2, prop, value, receiver) {
                  if (prop in cache) {
                    cache[prop] = value;
                  } else {
                    target[prop] = value;
                  }
                  return true;
                },
                defineProperty(proxyTarget2, prop, desc) {
                  return Reflect.defineProperty(cache, prop, desc);
                },
                deleteProperty(proxyTarget2, prop) {
                  return Reflect.deleteProperty(cache, prop);
                }
              };
              let proxyTarget = Object.create(target);
              return new Proxy(proxyTarget, handlers);
            };
            const wrapEvent = (wrapperMap) => ({
              addListener(target, listener, ...args) {
                target.addListener(wrapperMap.get(listener), ...args);
              },
              hasListener(target, listener) {
                return target.hasListener(wrapperMap.get(listener));
              },
              removeListener(target, listener) {
                target.removeListener(wrapperMap.get(listener));
              }
            });
            const onRequestFinishedWrappers = new DefaultWeakMap((listener) => {
              if (typeof listener !== "function") {
                return listener;
              }
              return function onRequestFinished(req) {
                const wrappedReq = wrapObject(
                  req,
                  {},
                  /* wrappers */
                  {
                    getContent: {
                      minArgs: 0,
                      maxArgs: 0
                    }
                  }
                );
                listener(wrappedReq);
              };
            });
            const onMessageWrappers = new DefaultWeakMap((listener) => {
              if (typeof listener !== "function") {
                return listener;
              }
              return function onMessage(message, sender, sendResponse) {
                let didCallSendResponse = false;
                let wrappedSendResponse;
                let sendResponsePromise = new Promise((resolve) => {
                  wrappedSendResponse = function(response) {
                    didCallSendResponse = true;
                    resolve(response);
                  };
                });
                let result;
                try {
                  result = listener(message, sender, wrappedSendResponse);
                } catch (err) {
                  result = Promise.reject(err);
                }
                const isResultThenable = result !== true && isThenable(result);
                if (result !== true && !isResultThenable && !didCallSendResponse) {
                  return false;
                }
                const sendPromisedResult = (promise) => {
                  promise.then(
                    (msg) => {
                      sendResponse(msg);
                    },
                    (error) => {
                      let message2;
                      if (error && (error instanceof Error || typeof error.message === "string")) {
                        message2 = error.message;
                      } else {
                        message2 = "An unexpected error occurred";
                      }
                      sendResponse({
                        __mozWebExtensionPolyfillReject__: true,
                        message: message2
                      });
                    }
                  ).catch((err) => {
                    console.error("Failed to send onMessage rejected reply", err);
                  });
                };
                if (isResultThenable) {
                  sendPromisedResult(result);
                } else {
                  sendPromisedResult(sendResponsePromise);
                }
                return true;
              };
            });
            const wrappedSendMessageCallback = ({ reject, resolve }, reply) => {
              if (extensionAPIs.runtime.lastError) {
                if (extensionAPIs.runtime.lastError.message === CHROME_SEND_MESSAGE_CALLBACK_NO_RESPONSE_MESSAGE) {
                  resolve();
                } else {
                  reject(new Error(extensionAPIs.runtime.lastError.message));
                }
              } else if (reply && reply.__mozWebExtensionPolyfillReject__) {
                reject(new Error(reply.message));
              } else {
                resolve(reply);
              }
            };
            const wrappedSendMessage = (name, metadata, apiNamespaceObj, ...args) => {
              if (args.length < metadata.minArgs) {
                throw new Error(
                  `Expected at least ${metadata.minArgs} ${pluralizeArguments(
                    metadata.minArgs
                  )} for ${name}(), got ${args.length}`
                );
              }
              if (args.length > metadata.maxArgs) {
                throw new Error(
                  `Expected at most ${metadata.maxArgs} ${pluralizeArguments(
                    metadata.maxArgs
                  )} for ${name}(), got ${args.length}`
                );
              }
              return new Promise((resolve, reject) => {
                const wrappedCb = wrappedSendMessageCallback.bind(null, {
                  resolve,
                  reject
                });
                args.push(wrappedCb);
                apiNamespaceObj.sendMessage(...args);
              });
            };
            const staticWrappers = {
              devtools: {
                network: {
                  onRequestFinished: wrapEvent(onRequestFinishedWrappers)
                }
              },
              runtime: {
                onMessage: wrapEvent(onMessageWrappers),
                onMessageExternal: wrapEvent(onMessageWrappers),
                sendMessage: wrappedSendMessage.bind(null, "sendMessage", {
                  minArgs: 1,
                  maxArgs: 3
                })
              },
              tabs: {
                sendMessage: wrappedSendMessage.bind(null, "sendMessage", {
                  minArgs: 2,
                  maxArgs: 3
                })
              }
            };
            const settingMetadata = {
              clear: {
                minArgs: 1,
                maxArgs: 1
              },
              get: {
                minArgs: 1,
                maxArgs: 1
              },
              set: {
                minArgs: 1,
                maxArgs: 1
              }
            };
            apiMetadata.privacy = {
              network: {
                "*": settingMetadata
              },
              services: {
                "*": settingMetadata
              },
              websites: {
                "*": settingMetadata
              }
            };
            return wrapObject(extensionAPIs, staticWrappers, apiMetadata);
          };
          module2.exports = wrapAPIs(chrome);
        } else {
          module2.exports = globalThis.browser;
        }
      }
    );
  }
});
export default require_browser_polyfill_js_008();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJvd3Nlci1wb2x5ZmlsbC5qcy1NU3BKQTNhMS5qcyIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2Jyb3dzZXItcG9seWZpbGwuanMiXSwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIChnbG9iYWwsIGZhY3RvcnkpIHtcbiAgaWYgKHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kKSB7XG4gICAgZGVmaW5lKFwid2ViZXh0ZW5zaW9uLXBvbHlmaWxsXCIsIFtcIm1vZHVsZVwiXSwgZmFjdG9yeSk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICBmYWN0b3J5KG1vZHVsZSk7XG4gIH0gZWxzZSB7XG4gICAgdmFyIG1vZCA9IHtcbiAgICAgIGV4cG9ydHM6IHt9LFxuICAgIH07XG4gICAgZmFjdG9yeShtb2QpO1xuICAgIGdsb2JhbC5icm93c2VyID0gbW9kLmV4cG9ydHM7XG4gIH1cbn0pKFxuICB0eXBlb2YgZ2xvYmFsVGhpcyAhPT0gXCJ1bmRlZmluZWRcIlxuICAgID8gZ2xvYmFsVGhpc1xuICAgIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCJcbiAgICAgID8gc2VsZlxuICAgICAgOiB0aGlzLFxuICBmdW5jdGlvbiAobW9kdWxlKSB7XG4gICAgLyogd2ViZXh0ZW5zaW9uLXBvbHlmaWxsIC0gdjAuMTAuMCAtIEZyaSBBdWcgMTIgMjAyMiAxOTo0Mjo0NCAqL1xuXG4gICAgLyogLSotIE1vZGU6IGluZGVudC10YWJzLW1vZGU6IG5pbDsganMtaW5kZW50LWxldmVsOiAyIC0qLSAqL1xuXG4gICAgLyogdmltOiBzZXQgc3RzPTIgc3c9MiBldCB0dz04MDogKi9cblxuICAgIC8qIFRoaXMgU291cmNlIENvZGUgRm9ybSBpcyBzdWJqZWN0IHRvIHRoZSB0ZXJtcyBvZiB0aGUgTW96aWxsYSBQdWJsaWNcbiAgICAgKiBMaWNlbnNlLCB2LiAyLjAuIElmIGEgY29weSBvZiB0aGUgTVBMIHdhcyBub3QgZGlzdHJpYnV0ZWQgd2l0aCB0aGlzXG4gICAgICogZmlsZSwgWW91IGNhbiBvYnRhaW4gb25lIGF0IGh0dHA6Ly9tb3ppbGxhLm9yZy9NUEwvMi4wLy4gKi9cbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIGlmICghZ2xvYmFsVGhpcy5jaHJvbWU/LnJ1bnRpbWU/LmlkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIFwiVGhpcyBzY3JpcHQgc2hvdWxkIG9ubHkgYmUgbG9hZGVkIGluIGEgYnJvd3NlciBleHRlbnNpb24uXCIsXG4gICAgICApO1xuICAgIH1cblxuICAgIGlmIChcbiAgICAgIHR5cGVvZiBnbG9iYWxUaGlzLmJyb3dzZXIgPT09IFwidW5kZWZpbmVkXCIgfHxcbiAgICAgIE9iamVjdC5nZXRQcm90b3R5cGVPZihnbG9iYWxUaGlzLmJyb3dzZXIpICE9PSBPYmplY3QucHJvdG90eXBlXG4gICAgKSB7XG4gICAgICBjb25zdCBDSFJPTUVfU0VORF9NRVNTQUdFX0NBTExCQUNLX05PX1JFU1BPTlNFX01FU1NBR0UgPVxuICAgICAgICBcIlRoZSBtZXNzYWdlIHBvcnQgY2xvc2VkIGJlZm9yZSBhIHJlc3BvbnNlIHdhcyByZWNlaXZlZC5cIjsgLy8gV3JhcHBpbmcgdGhlIGJ1bGsgb2YgdGhpcyBwb2x5ZmlsbCBpbiBhIG9uZS10aW1lLXVzZSBmdW5jdGlvbiBpcyBhIG1pbm9yXG4gICAgICAvLyBvcHRpbWl6YXRpb24gZm9yIEZpcmVmb3guIFNpbmNlIFNwaWRlcm1vbmtleSBkb2VzIG5vdCBmdWxseSBwYXJzZSB0aGVcbiAgICAgIC8vIGNvbnRlbnRzIG9mIGEgZnVuY3Rpb24gdW50aWwgdGhlIGZpcnN0IHRpbWUgaXQncyBjYWxsZWQsIGFuZCBzaW5jZSBpdCB3aWxsXG4gICAgICAvLyBuZXZlciBhY3R1YWxseSBuZWVkIHRvIGJlIGNhbGxlZCwgdGhpcyBhbGxvd3MgdGhlIHBvbHlmaWxsIHRvIGJlIGluY2x1ZGVkXG4gICAgICAvLyBpbiBGaXJlZm94IG5lYXJseSBmb3IgZnJlZS5cblxuICAgICAgY29uc3Qgd3JhcEFQSXMgPSAoZXh0ZW5zaW9uQVBJcykgPT4ge1xuICAgICAgICAvLyBOT1RFOiBhcGlNZXRhZGF0YSBpcyBhc3NvY2lhdGVkIHRvIHRoZSBjb250ZW50IG9mIHRoZSBhcGktbWV0YWRhdGEuanNvbiBmaWxlXG4gICAgICAgIC8vIGF0IGJ1aWxkIHRpbWUgYnkgcmVwbGFjaW5nIHRoZSBmb2xsb3dpbmcgXCJpbmNsdWRlXCIgd2l0aCB0aGUgY29udGVudCBvZiB0aGVcbiAgICAgICAgLy8gSlNPTiBmaWxlLlxuICAgICAgICBjb25zdCBhcGlNZXRhZGF0YSA9IHtcbiAgICAgICAgICBhbGFybXM6IHtcbiAgICAgICAgICAgIGNsZWFyOiB7XG4gICAgICAgICAgICAgIG1pbkFyZ3M6IDAsXG4gICAgICAgICAgICAgIG1heEFyZ3M6IDEsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY2xlYXJBbGw6IHtcbiAgICAgICAgICAgICAgbWluQXJnczogMCxcbiAgICAgICAgICAgICAgbWF4QXJnczogMCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBnZXQ6IHtcbiAgICAgICAgICAgICAgbWluQXJnczogMCxcbiAgICAgICAgICAgICAgbWF4QXJnczogMSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBnZXRBbGw6IHtcbiAgICAgICAgICAgICAgbWluQXJnczogMCxcbiAgICAgICAgICAgICAgbWF4QXJnczogMCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgICBib29rbWFya3M6IHtcbiAgICAgICAgICAgIGNyZWF0ZToge1xuICAgICAgICAgICAgICBtaW5BcmdzOiAxLFxuICAgICAgICAgICAgICBtYXhBcmdzOiAxLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGdldDoge1xuICAgICAgICAgICAgICBtaW5BcmdzOiAxLFxuICAgICAgICAgICAgICBtYXhBcmdzOiAxLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGdldENoaWxkcmVuOiB7XG4gICAgICAgICAgICAgIG1pbkFyZ3M6IDEsXG4gICAgICAgICAgICAgIG1heEFyZ3M6IDEsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZ2V0UmVjZW50OiB7XG4gICAgICAgICAgICAgIG1pbkFyZ3M6IDEsXG4gICAgICAgICAgICAgIG1heEFyZ3M6IDEsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZ2V0U3ViVHJlZToge1xuICAgICAgICAgICAgICBtaW5BcmdzOiAxLFxuICAgICAgICAgICAgICBtYXhBcmdzOiAxLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGdldFRyZWU6IHtcbiAgICAgICAgICAgICAgbWluQXJnczogMCxcbiAgICAgICAgICAgICAgbWF4QXJnczogMCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBtb3ZlOiB7XG4gICAgICAgICAgICAgIG1pbkFyZ3M6IDIsXG4gICAgICAgICAgICAgIG1heEFyZ3M6IDIsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcmVtb3ZlOiB7XG4gICAgICAgICAgICAgIG1pbkFyZ3M6IDEsXG4gICAgICAgICAgICAgIG1heEFyZ3M6IDEsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcmVtb3ZlVHJlZToge1xuICAgICAgICAgICAgICBtaW5BcmdzOiAxLFxuICAgICAgICAgICAgICBtYXhBcmdzOiAxLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNlYXJjaDoge1xuICAgICAgICAgICAgICBtaW5BcmdzOiAxLFxuICAgICAgICAgICAgICBtYXhBcmdzOiAxLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHVwZGF0ZToge1xuICAgICAgICAgICAgICBtaW5BcmdzOiAyLFxuICAgICAgICAgICAgICBtYXhBcmdzOiAyLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIGJyb3dzZXJBY3Rpb246IHtcbiAgICAgICAgICAgIGRpc2FibGU6IHtcbiAgICAgICAgICAgICAgbWluQXJnczogMCxcbiAgICAgICAgICAgICAgbWF4QXJnczogMSxcbiAgICAgICAgICAgICAgZmFsbGJhY2tUb05vQ2FsbGJhY2s6IHRydWUsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW5hYmxlOiB7XG4gICAgICAgICAgICAgIG1pbkFyZ3M6IDAsXG4gICAgICAgICAgICAgIG1heEFyZ3M6IDEsXG4gICAgICAgICAgICAgIGZhbGxiYWNrVG9Ob0NhbGxiYWNrOiB0cnVlLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGdldEJhZGdlQmFja2dyb3VuZENvbG9yOiB7XG4gICAgICAgICAgICAgIG1pbkFyZ3M6IDEsXG4gICAgICAgICAgICAgIG1heEFyZ3M6IDEsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZ2V0QmFkZ2VUZXh0OiB7XG4gICAgICAgICAgICAgIG1pbkFyZ3M6IDEsXG4gICAgICAgICAgICAgIG1heEFyZ3M6IDEsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZ2V0UG9wdXA6IHtcbiAgICAgICAgICAgICAgbWluQXJnczogMSxcbiAgICAgICAgICAgICAgbWF4QXJnczogMSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBnZXRUaXRsZToge1xuICAgICAgICAgICAgICBtaW5BcmdzOiAxLFxuICAgICAgICAgICAgICBtYXhBcmdzOiAxLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG9wZW5Qb3B1cDoge1xuICAgICAgICAgICAgICBtaW5BcmdzOiAwLFxuICAgICAgICAgICAgICBtYXhBcmdzOiAwLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNldEJhZGdlQmFja2dyb3VuZENvbG9yOiB7XG4gICAgICAgICAgICAgIG1pbkFyZ3M6IDEsXG4gICAgICAgICAgICAgIG1heEFyZ3M6IDEsXG4gICAgICAgICAgICAgIGZhbGxiYWNrVG9Ob0NhbGxiYWNrOiB0cnVlLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNldEJhZGdlVGV4dDoge1xuICAgICAgICAgICAgICBtaW5BcmdzOiAxLFxuICAgICAgICAgICAgICBtYXhBcmdzOiAxLFxuICAgICAgICAgICAgICBmYWxsYmFja1RvTm9DYWxsYmFjazogdHJ1ZSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzZXRJY29uOiB7XG4gICAgICAgICAgICAgIG1pbkFyZ3M6IDEsXG4gICAgICAgICAgICAgIG1heEFyZ3M6IDEsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2V0UG9wdXA6IHtcbiAgICAgICAgICAgICAgbWluQXJnczogMSxcbiAgICAgICAgICAgICAgbWF4QXJnczogMSxcbiAgICAgICAgICAgICAgZmFsbGJhY2tUb05vQ2FsbGJhY2s6IHRydWUsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2V0VGl0bGU6IHtcbiAgICAgICAgICAgICAgbWluQXJnczogMSxcbiAgICAgICAgICAgICAgbWF4QXJnczogMSxcbiAgICAgICAgICAgICAgZmFsbGJhY2tUb05vQ2FsbGJhY2s6IHRydWUsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgICAgYnJvd3NpbmdEYXRhOiB7XG4gICAgICAgICAgICByZW1vdmU6IHtcbiAgICAgICAgICAgICAgbWluQXJnczogMixcbiAgICAgICAgICAgICAgbWF4QXJnczogMixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICByZW1vdmVDYWNoZToge1xuICAgICAgICAgICAgICBtaW5BcmdzOiAxLFxuICAgICAgICAgICAgICBtYXhBcmdzOiAxLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHJlbW92ZUNvb2tpZXM6IHtcbiAgICAgICAgICAgICAgbWluQXJnczogMSxcbiAgICAgICAgICAgICAgbWF4QXJnczogMSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICByZW1vdmVEb3dubG9hZHM6IHtcbiAgICAgICAgICAgICAgbWluQXJnczogMSxcbiAgICAgICAgICAgICAgbWF4QXJnczogMSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICByZW1vdmVGb3JtRGF0YToge1xuICAgICAgICAgICAgICBtaW5BcmdzOiAxLFxuICAgICAgICAgICAgICBtYXhBcmdzOiAxLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHJlbW92ZUhpc3Rvcnk6IHtcbiAgICAgICAgICAgICAgbWluQXJnczogMSxcbiAgICAgICAgICAgICAgbWF4QXJnczogMSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICByZW1vdmVMb2NhbFN0b3JhZ2U6IHtcbiAgICAgICAgICAgICAgbWluQXJnczogMSxcbiAgICAgICAgICAgICAgbWF4QXJnczogMSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICByZW1vdmVQYXNzd29yZHM6IHtcbiAgICAgICAgICAgICAgbWluQXJnczogMSxcbiAgICAgICAgICAgICAgbWF4QXJnczogMSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICByZW1vdmVQbHVnaW5EYXRhOiB7XG4gICAgICAgICAgICAgIG1pbkFyZ3M6IDEsXG4gICAgICAgICAgICAgIG1heEFyZ3M6IDEsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2V0dGluZ3M6IHtcbiAgICAgICAgICAgICAgbWluQXJnczogMCxcbiAgICAgICAgICAgICAgbWF4QXJnczogMCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgICBjb21tYW5kczoge1xuICAgICAgICAgICAgZ2V0QWxsOiB7XG4gICAgICAgICAgICAgIG1pbkFyZ3M6IDAsXG4gICAgICAgICAgICAgIG1heEFyZ3M6IDAsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgICAgY29udGV4dE1lbnVzOiB7XG4gICAgICAgICAgICByZW1vdmU6IHtcbiAgICAgICAgICAgICAgbWluQXJnczogMSxcbiAgICAgICAgICAgICAgbWF4QXJnczogMSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICByZW1vdmVBbGw6IHtcbiAgICAgICAgICAgICAgbWluQXJnczogMCxcbiAgICAgICAgICAgICAgbWF4QXJnczogMCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB1cGRhdGU6IHtcbiAgICAgICAgICAgICAgbWluQXJnczogMixcbiAgICAgICAgICAgICAgbWF4QXJnczogMixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgICBjb29raWVzOiB7XG4gICAgICAgICAgICBnZXQ6IHtcbiAgICAgICAgICAgICAgbWluQXJnczogMSxcbiAgICAgICAgICAgICAgbWF4QXJnczogMSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBnZXRBbGw6IHtcbiAgICAgICAgICAgICAgbWluQXJnczogMSxcbiAgICAgICAgICAgICAgbWF4QXJnczogMSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBnZXRBbGxDb29raWVTdG9yZXM6IHtcbiAgICAgICAgICAgICAgbWluQXJnczogMCxcbiAgICAgICAgICAgICAgbWF4QXJnczogMCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICByZW1vdmU6IHtcbiAgICAgICAgICAgICAgbWluQXJnczogMSxcbiAgICAgICAgICAgICAgbWF4QXJnczogMSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzZXQ6IHtcbiAgICAgICAgICAgICAgbWluQXJnczogMSxcbiAgICAgICAgICAgICAgbWF4QXJnczogMSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgICBkZXZ0b29sczoge1xuICAgICAgICAgICAgaW5zcGVjdGVkV2luZG93OiB7XG4gICAgICAgICAgICAgIGV2YWw6IHtcbiAgICAgICAgICAgICAgICBtaW5BcmdzOiAxLFxuICAgICAgICAgICAgICAgIG1heEFyZ3M6IDIsXG4gICAgICAgICAgICAgICAgc2luZ2xlQ2FsbGJhY2tBcmc6IGZhbHNlLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHBhbmVsczoge1xuICAgICAgICAgICAgICBjcmVhdGU6IHtcbiAgICAgICAgICAgICAgICBtaW5BcmdzOiAzLFxuICAgICAgICAgICAgICAgIG1heEFyZ3M6IDMsXG4gICAgICAgICAgICAgICAgc2luZ2xlQ2FsbGJhY2tBcmc6IHRydWUsXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIGVsZW1lbnRzOiB7XG4gICAgICAgICAgICAgICAgY3JlYXRlU2lkZWJhclBhbmU6IHtcbiAgICAgICAgICAgICAgICAgIG1pbkFyZ3M6IDEsXG4gICAgICAgICAgICAgICAgICBtYXhBcmdzOiAxLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgICAgZG93bmxvYWRzOiB7XG4gICAgICAgICAgICBjYW5jZWw6IHtcbiAgICAgICAgICAgICAgbWluQXJnczogMSxcbiAgICAgICAgICAgICAgbWF4QXJnczogMSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBkb3dubG9hZDoge1xuICAgICAgICAgICAgICBtaW5BcmdzOiAxLFxuICAgICAgICAgICAgICBtYXhBcmdzOiAxLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVyYXNlOiB7XG4gICAgICAgICAgICAgIG1pbkFyZ3M6IDEsXG4gICAgICAgICAgICAgIG1heEFyZ3M6IDEsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZ2V0RmlsZUljb246IHtcbiAgICAgICAgICAgICAgbWluQXJnczogMSxcbiAgICAgICAgICAgICAgbWF4QXJnczogMixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBvcGVuOiB7XG4gICAgICAgICAgICAgIG1pbkFyZ3M6IDEsXG4gICAgICAgICAgICAgIG1heEFyZ3M6IDEsXG4gICAgICAgICAgICAgIGZhbGxiYWNrVG9Ob0NhbGxiYWNrOiB0cnVlLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHBhdXNlOiB7XG4gICAgICAgICAgICAgIG1pbkFyZ3M6IDEsXG4gICAgICAgICAgICAgIG1heEFyZ3M6IDEsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcmVtb3ZlRmlsZToge1xuICAgICAgICAgICAgICBtaW5BcmdzOiAxLFxuICAgICAgICAgICAgICBtYXhBcmdzOiAxLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHJlc3VtZToge1xuICAgICAgICAgICAgICBtaW5BcmdzOiAxLFxuICAgICAgICAgICAgICBtYXhBcmdzOiAxLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNlYXJjaDoge1xuICAgICAgICAgICAgICBtaW5BcmdzOiAxLFxuICAgICAgICAgICAgICBtYXhBcmdzOiAxLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNob3c6IHtcbiAgICAgICAgICAgICAgbWluQXJnczogMSxcbiAgICAgICAgICAgICAgbWF4QXJnczogMSxcbiAgICAgICAgICAgICAgZmFsbGJhY2tUb05vQ2FsbGJhY2s6IHRydWUsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgICAgZXh0ZW5zaW9uOiB7XG4gICAgICAgICAgICBpc0FsbG93ZWRGaWxlU2NoZW1lQWNjZXNzOiB7XG4gICAgICAgICAgICAgIG1pbkFyZ3M6IDAsXG4gICAgICAgICAgICAgIG1heEFyZ3M6IDAsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgaXNBbGxvd2VkSW5jb2duaXRvQWNjZXNzOiB7XG4gICAgICAgICAgICAgIG1pbkFyZ3M6IDAsXG4gICAgICAgICAgICAgIG1heEFyZ3M6IDAsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgICAgaGlzdG9yeToge1xuICAgICAgICAgICAgYWRkVXJsOiB7XG4gICAgICAgICAgICAgIG1pbkFyZ3M6IDEsXG4gICAgICAgICAgICAgIG1heEFyZ3M6IDEsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZGVsZXRlQWxsOiB7XG4gICAgICAgICAgICAgIG1pbkFyZ3M6IDAsXG4gICAgICAgICAgICAgIG1heEFyZ3M6IDAsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZGVsZXRlUmFuZ2U6IHtcbiAgICAgICAgICAgICAgbWluQXJnczogMSxcbiAgICAgICAgICAgICAgbWF4QXJnczogMSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBkZWxldGVVcmw6IHtcbiAgICAgICAgICAgICAgbWluQXJnczogMSxcbiAgICAgICAgICAgICAgbWF4QXJnczogMSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBnZXRWaXNpdHM6IHtcbiAgICAgICAgICAgICAgbWluQXJnczogMSxcbiAgICAgICAgICAgICAgbWF4QXJnczogMSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzZWFyY2g6IHtcbiAgICAgICAgICAgICAgbWluQXJnczogMSxcbiAgICAgICAgICAgICAgbWF4QXJnczogMSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgICBpMThuOiB7XG4gICAgICAgICAgICBkZXRlY3RMYW5ndWFnZToge1xuICAgICAgICAgICAgICBtaW5BcmdzOiAxLFxuICAgICAgICAgICAgICBtYXhBcmdzOiAxLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGdldEFjY2VwdExhbmd1YWdlczoge1xuICAgICAgICAgICAgICBtaW5BcmdzOiAwLFxuICAgICAgICAgICAgICBtYXhBcmdzOiAwLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIGlkZW50aXR5OiB7XG4gICAgICAgICAgICBsYXVuY2hXZWJBdXRoRmxvdzoge1xuICAgICAgICAgICAgICBtaW5BcmdzOiAxLFxuICAgICAgICAgICAgICBtYXhBcmdzOiAxLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIGlkbGU6IHtcbiAgICAgICAgICAgIHF1ZXJ5U3RhdGU6IHtcbiAgICAgICAgICAgICAgbWluQXJnczogMSxcbiAgICAgICAgICAgICAgbWF4QXJnczogMSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgICBtYW5hZ2VtZW50OiB7XG4gICAgICAgICAgICBnZXQ6IHtcbiAgICAgICAgICAgICAgbWluQXJnczogMSxcbiAgICAgICAgICAgICAgbWF4QXJnczogMSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBnZXRBbGw6IHtcbiAgICAgICAgICAgICAgbWluQXJnczogMCxcbiAgICAgICAgICAgICAgbWF4QXJnczogMCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBnZXRTZWxmOiB7XG4gICAgICAgICAgICAgIG1pbkFyZ3M6IDAsXG4gICAgICAgICAgICAgIG1heEFyZ3M6IDAsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2V0RW5hYmxlZDoge1xuICAgICAgICAgICAgICBtaW5BcmdzOiAyLFxuICAgICAgICAgICAgICBtYXhBcmdzOiAyLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHVuaW5zdGFsbFNlbGY6IHtcbiAgICAgICAgICAgICAgbWluQXJnczogMCxcbiAgICAgICAgICAgICAgbWF4QXJnczogMSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgICBub3RpZmljYXRpb25zOiB7XG4gICAgICAgICAgICBjbGVhcjoge1xuICAgICAgICAgICAgICBtaW5BcmdzOiAxLFxuICAgICAgICAgICAgICBtYXhBcmdzOiAxLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNyZWF0ZToge1xuICAgICAgICAgICAgICBtaW5BcmdzOiAxLFxuICAgICAgICAgICAgICBtYXhBcmdzOiAyLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGdldEFsbDoge1xuICAgICAgICAgICAgICBtaW5BcmdzOiAwLFxuICAgICAgICAgICAgICBtYXhBcmdzOiAwLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGdldFBlcm1pc3Npb25MZXZlbDoge1xuICAgICAgICAgICAgICBtaW5BcmdzOiAwLFxuICAgICAgICAgICAgICBtYXhBcmdzOiAwLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHVwZGF0ZToge1xuICAgICAgICAgICAgICBtaW5BcmdzOiAyLFxuICAgICAgICAgICAgICBtYXhBcmdzOiAyLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIHBhZ2VBY3Rpb246IHtcbiAgICAgICAgICAgIGdldFBvcHVwOiB7XG4gICAgICAgICAgICAgIG1pbkFyZ3M6IDEsXG4gICAgICAgICAgICAgIG1heEFyZ3M6IDEsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZ2V0VGl0bGU6IHtcbiAgICAgICAgICAgICAgbWluQXJnczogMSxcbiAgICAgICAgICAgICAgbWF4QXJnczogMSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBoaWRlOiB7XG4gICAgICAgICAgICAgIG1pbkFyZ3M6IDEsXG4gICAgICAgICAgICAgIG1heEFyZ3M6IDEsXG4gICAgICAgICAgICAgIGZhbGxiYWNrVG9Ob0NhbGxiYWNrOiB0cnVlLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNldEljb246IHtcbiAgICAgICAgICAgICAgbWluQXJnczogMSxcbiAgICAgICAgICAgICAgbWF4QXJnczogMSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzZXRQb3B1cDoge1xuICAgICAgICAgICAgICBtaW5BcmdzOiAxLFxuICAgICAgICAgICAgICBtYXhBcmdzOiAxLFxuICAgICAgICAgICAgICBmYWxsYmFja1RvTm9DYWxsYmFjazogdHJ1ZSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzZXRUaXRsZToge1xuICAgICAgICAgICAgICBtaW5BcmdzOiAxLFxuICAgICAgICAgICAgICBtYXhBcmdzOiAxLFxuICAgICAgICAgICAgICBmYWxsYmFja1RvTm9DYWxsYmFjazogdHJ1ZSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzaG93OiB7XG4gICAgICAgICAgICAgIG1pbkFyZ3M6IDEsXG4gICAgICAgICAgICAgIG1heEFyZ3M6IDEsXG4gICAgICAgICAgICAgIGZhbGxiYWNrVG9Ob0NhbGxiYWNrOiB0cnVlLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIHBlcm1pc3Npb25zOiB7XG4gICAgICAgICAgICBjb250YWluczoge1xuICAgICAgICAgICAgICBtaW5BcmdzOiAxLFxuICAgICAgICAgICAgICBtYXhBcmdzOiAxLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGdldEFsbDoge1xuICAgICAgICAgICAgICBtaW5BcmdzOiAwLFxuICAgICAgICAgICAgICBtYXhBcmdzOiAwLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHJlbW92ZToge1xuICAgICAgICAgICAgICBtaW5BcmdzOiAxLFxuICAgICAgICAgICAgICBtYXhBcmdzOiAxLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHJlcXVlc3Q6IHtcbiAgICAgICAgICAgICAgbWluQXJnczogMSxcbiAgICAgICAgICAgICAgbWF4QXJnczogMSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgICBydW50aW1lOiB7XG4gICAgICAgICAgICBnZXRCYWNrZ3JvdW5kUGFnZToge1xuICAgICAgICAgICAgICBtaW5BcmdzOiAwLFxuICAgICAgICAgICAgICBtYXhBcmdzOiAwLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGdldFBsYXRmb3JtSW5mbzoge1xuICAgICAgICAgICAgICBtaW5BcmdzOiAwLFxuICAgICAgICAgICAgICBtYXhBcmdzOiAwLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG9wZW5PcHRpb25zUGFnZToge1xuICAgICAgICAgICAgICBtaW5BcmdzOiAwLFxuICAgICAgICAgICAgICBtYXhBcmdzOiAwLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHJlcXVlc3RVcGRhdGVDaGVjazoge1xuICAgICAgICAgICAgICBtaW5BcmdzOiAwLFxuICAgICAgICAgICAgICBtYXhBcmdzOiAwLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNlbmRNZXNzYWdlOiB7XG4gICAgICAgICAgICAgIG1pbkFyZ3M6IDEsXG4gICAgICAgICAgICAgIG1heEFyZ3M6IDMsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2VuZE5hdGl2ZU1lc3NhZ2U6IHtcbiAgICAgICAgICAgICAgbWluQXJnczogMixcbiAgICAgICAgICAgICAgbWF4QXJnczogMixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzZXRVbmluc3RhbGxVUkw6IHtcbiAgICAgICAgICAgICAgbWluQXJnczogMSxcbiAgICAgICAgICAgICAgbWF4QXJnczogMSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgICBzZXNzaW9uczoge1xuICAgICAgICAgICAgZ2V0RGV2aWNlczoge1xuICAgICAgICAgICAgICBtaW5BcmdzOiAwLFxuICAgICAgICAgICAgICBtYXhBcmdzOiAxLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGdldFJlY2VudGx5Q2xvc2VkOiB7XG4gICAgICAgICAgICAgIG1pbkFyZ3M6IDAsXG4gICAgICAgICAgICAgIG1heEFyZ3M6IDEsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcmVzdG9yZToge1xuICAgICAgICAgICAgICBtaW5BcmdzOiAwLFxuICAgICAgICAgICAgICBtYXhBcmdzOiAxLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIHN0b3JhZ2U6IHtcbiAgICAgICAgICAgIGxvY2FsOiB7XG4gICAgICAgICAgICAgIGNsZWFyOiB7XG4gICAgICAgICAgICAgICAgbWluQXJnczogMCxcbiAgICAgICAgICAgICAgICBtYXhBcmdzOiAwLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBnZXQ6IHtcbiAgICAgICAgICAgICAgICBtaW5BcmdzOiAwLFxuICAgICAgICAgICAgICAgIG1heEFyZ3M6IDEsXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIGdldEJ5dGVzSW5Vc2U6IHtcbiAgICAgICAgICAgICAgICBtaW5BcmdzOiAwLFxuICAgICAgICAgICAgICAgIG1heEFyZ3M6IDEsXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHJlbW92ZToge1xuICAgICAgICAgICAgICAgIG1pbkFyZ3M6IDEsXG4gICAgICAgICAgICAgICAgbWF4QXJnczogMSxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgc2V0OiB7XG4gICAgICAgICAgICAgICAgbWluQXJnczogMSxcbiAgICAgICAgICAgICAgICBtYXhBcmdzOiAxLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG1hbmFnZWQ6IHtcbiAgICAgICAgICAgICAgZ2V0OiB7XG4gICAgICAgICAgICAgICAgbWluQXJnczogMCxcbiAgICAgICAgICAgICAgICBtYXhBcmdzOiAxLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBnZXRCeXRlc0luVXNlOiB7XG4gICAgICAgICAgICAgICAgbWluQXJnczogMCxcbiAgICAgICAgICAgICAgICBtYXhBcmdzOiAxLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHN5bmM6IHtcbiAgICAgICAgICAgICAgY2xlYXI6IHtcbiAgICAgICAgICAgICAgICBtaW5BcmdzOiAwLFxuICAgICAgICAgICAgICAgIG1heEFyZ3M6IDAsXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIGdldDoge1xuICAgICAgICAgICAgICAgIG1pbkFyZ3M6IDAsXG4gICAgICAgICAgICAgICAgbWF4QXJnczogMSxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgZ2V0Qnl0ZXNJblVzZToge1xuICAgICAgICAgICAgICAgIG1pbkFyZ3M6IDAsXG4gICAgICAgICAgICAgICAgbWF4QXJnczogMSxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgcmVtb3ZlOiB7XG4gICAgICAgICAgICAgICAgbWluQXJnczogMSxcbiAgICAgICAgICAgICAgICBtYXhBcmdzOiAxLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBzZXQ6IHtcbiAgICAgICAgICAgICAgICBtaW5BcmdzOiAxLFxuICAgICAgICAgICAgICAgIG1heEFyZ3M6IDEsXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgICAgdGFiczoge1xuICAgICAgICAgICAgY2FwdHVyZVZpc2libGVUYWI6IHtcbiAgICAgICAgICAgICAgbWluQXJnczogMCxcbiAgICAgICAgICAgICAgbWF4QXJnczogMixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjcmVhdGU6IHtcbiAgICAgICAgICAgICAgbWluQXJnczogMSxcbiAgICAgICAgICAgICAgbWF4QXJnczogMSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBkZXRlY3RMYW5ndWFnZToge1xuICAgICAgICAgICAgICBtaW5BcmdzOiAwLFxuICAgICAgICAgICAgICBtYXhBcmdzOiAxLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGRpc2NhcmQ6IHtcbiAgICAgICAgICAgICAgbWluQXJnczogMCxcbiAgICAgICAgICAgICAgbWF4QXJnczogMSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBkdXBsaWNhdGU6IHtcbiAgICAgICAgICAgICAgbWluQXJnczogMSxcbiAgICAgICAgICAgICAgbWF4QXJnczogMSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBleGVjdXRlU2NyaXB0OiB7XG4gICAgICAgICAgICAgIG1pbkFyZ3M6IDEsXG4gICAgICAgICAgICAgIG1heEFyZ3M6IDIsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZ2V0OiB7XG4gICAgICAgICAgICAgIG1pbkFyZ3M6IDEsXG4gICAgICAgICAgICAgIG1heEFyZ3M6IDEsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZ2V0Q3VycmVudDoge1xuICAgICAgICAgICAgICBtaW5BcmdzOiAwLFxuICAgICAgICAgICAgICBtYXhBcmdzOiAwLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGdldFpvb206IHtcbiAgICAgICAgICAgICAgbWluQXJnczogMCxcbiAgICAgICAgICAgICAgbWF4QXJnczogMSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBnZXRab29tU2V0dGluZ3M6IHtcbiAgICAgICAgICAgICAgbWluQXJnczogMCxcbiAgICAgICAgICAgICAgbWF4QXJnczogMSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBnb0JhY2s6IHtcbiAgICAgICAgICAgICAgbWluQXJnczogMCxcbiAgICAgICAgICAgICAgbWF4QXJnczogMSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBnb0ZvcndhcmQ6IHtcbiAgICAgICAgICAgICAgbWluQXJnczogMCxcbiAgICAgICAgICAgICAgbWF4QXJnczogMSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBoaWdobGlnaHQ6IHtcbiAgICAgICAgICAgICAgbWluQXJnczogMSxcbiAgICAgICAgICAgICAgbWF4QXJnczogMSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBpbnNlcnRDU1M6IHtcbiAgICAgICAgICAgICAgbWluQXJnczogMSxcbiAgICAgICAgICAgICAgbWF4QXJnczogMixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBtb3ZlOiB7XG4gICAgICAgICAgICAgIG1pbkFyZ3M6IDIsXG4gICAgICAgICAgICAgIG1heEFyZ3M6IDIsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcXVlcnk6IHtcbiAgICAgICAgICAgICAgbWluQXJnczogMSxcbiAgICAgICAgICAgICAgbWF4QXJnczogMSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICByZWxvYWQ6IHtcbiAgICAgICAgICAgICAgbWluQXJnczogMCxcbiAgICAgICAgICAgICAgbWF4QXJnczogMixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICByZW1vdmU6IHtcbiAgICAgICAgICAgICAgbWluQXJnczogMSxcbiAgICAgICAgICAgICAgbWF4QXJnczogMSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICByZW1vdmVDU1M6IHtcbiAgICAgICAgICAgICAgbWluQXJnczogMSxcbiAgICAgICAgICAgICAgbWF4QXJnczogMixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzZW5kTWVzc2FnZToge1xuICAgICAgICAgICAgICBtaW5BcmdzOiAyLFxuICAgICAgICAgICAgICBtYXhBcmdzOiAzLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNldFpvb206IHtcbiAgICAgICAgICAgICAgbWluQXJnczogMSxcbiAgICAgICAgICAgICAgbWF4QXJnczogMixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzZXRab29tU2V0dGluZ3M6IHtcbiAgICAgICAgICAgICAgbWluQXJnczogMSxcbiAgICAgICAgICAgICAgbWF4QXJnczogMixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB1cGRhdGU6IHtcbiAgICAgICAgICAgICAgbWluQXJnczogMSxcbiAgICAgICAgICAgICAgbWF4QXJnczogMixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgICB0b3BTaXRlczoge1xuICAgICAgICAgICAgZ2V0OiB7XG4gICAgICAgICAgICAgIG1pbkFyZ3M6IDAsXG4gICAgICAgICAgICAgIG1heEFyZ3M6IDAsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgICAgd2ViTmF2aWdhdGlvbjoge1xuICAgICAgICAgICAgZ2V0QWxsRnJhbWVzOiB7XG4gICAgICAgICAgICAgIG1pbkFyZ3M6IDEsXG4gICAgICAgICAgICAgIG1heEFyZ3M6IDEsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZ2V0RnJhbWU6IHtcbiAgICAgICAgICAgICAgbWluQXJnczogMSxcbiAgICAgICAgICAgICAgbWF4QXJnczogMSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgICB3ZWJSZXF1ZXN0OiB7XG4gICAgICAgICAgICBoYW5kbGVyQmVoYXZpb3JDaGFuZ2VkOiB7XG4gICAgICAgICAgICAgIG1pbkFyZ3M6IDAsXG4gICAgICAgICAgICAgIG1heEFyZ3M6IDAsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgICAgd2luZG93czoge1xuICAgICAgICAgICAgY3JlYXRlOiB7XG4gICAgICAgICAgICAgIG1pbkFyZ3M6IDAsXG4gICAgICAgICAgICAgIG1heEFyZ3M6IDEsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZ2V0OiB7XG4gICAgICAgICAgICAgIG1pbkFyZ3M6IDEsXG4gICAgICAgICAgICAgIG1heEFyZ3M6IDIsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZ2V0QWxsOiB7XG4gICAgICAgICAgICAgIG1pbkFyZ3M6IDAsXG4gICAgICAgICAgICAgIG1heEFyZ3M6IDEsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZ2V0Q3VycmVudDoge1xuICAgICAgICAgICAgICBtaW5BcmdzOiAwLFxuICAgICAgICAgICAgICBtYXhBcmdzOiAxLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGdldExhc3RGb2N1c2VkOiB7XG4gICAgICAgICAgICAgIG1pbkFyZ3M6IDAsXG4gICAgICAgICAgICAgIG1heEFyZ3M6IDEsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcmVtb3ZlOiB7XG4gICAgICAgICAgICAgIG1pbkFyZ3M6IDEsXG4gICAgICAgICAgICAgIG1heEFyZ3M6IDEsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdXBkYXRlOiB7XG4gICAgICAgICAgICAgIG1pbkFyZ3M6IDIsXG4gICAgICAgICAgICAgIG1heEFyZ3M6IDIsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKE9iamVjdC5rZXlzKGFwaU1ldGFkYXRhKS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICBcImFwaS1tZXRhZGF0YS5qc29uIGhhcyBub3QgYmVlbiBpbmNsdWRlZCBpbiBicm93c2VyLXBvbHlmaWxsXCIsXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICAvKipcbiAgICAgICAgICogQSBXZWFrTWFwIHN1YmNsYXNzIHdoaWNoIGNyZWF0ZXMgYW5kIHN0b3JlcyBhIHZhbHVlIGZvciBhbnkga2V5IHdoaWNoIGRvZXNcbiAgICAgICAgICogbm90IGV4aXN0IHdoZW4gYWNjZXNzZWQsIGJ1dCBiZWhhdmVzIGV4YWN0bHkgYXMgYW4gb3JkaW5hcnkgV2Vha01hcFxuICAgICAgICAgKiBvdGhlcndpc2UuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGNyZWF0ZUl0ZW1cbiAgICAgICAgICogICAgICAgIEEgZnVuY3Rpb24gd2hpY2ggd2lsbCBiZSBjYWxsZWQgaW4gb3JkZXIgdG8gY3JlYXRlIHRoZSB2YWx1ZSBmb3IgYW55XG4gICAgICAgICAqICAgICAgICBrZXkgd2hpY2ggZG9lcyBub3QgZXhpc3QsIHRoZSBmaXJzdCB0aW1lIGl0IGlzIGFjY2Vzc2VkLiBUaGVcbiAgICAgICAgICogICAgICAgIGZ1bmN0aW9uIHJlY2VpdmVzLCBhcyBpdHMgb25seSBhcmd1bWVudCwgdGhlIGtleSBiZWluZyBjcmVhdGVkLlxuICAgICAgICAgKi9cblxuICAgICAgICBjbGFzcyBEZWZhdWx0V2Vha01hcCBleHRlbmRzIFdlYWtNYXAge1xuICAgICAgICAgIGNvbnN0cnVjdG9yKGNyZWF0ZUl0ZW0sIGl0ZW1zID0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBzdXBlcihpdGVtcyk7XG4gICAgICAgICAgICB0aGlzLmNyZWF0ZUl0ZW0gPSBjcmVhdGVJdGVtO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGdldChrZXkpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5oYXMoa2V5KSkge1xuICAgICAgICAgICAgICB0aGlzLnNldChrZXksIHRoaXMuY3JlYXRlSXRlbShrZXkpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHN1cGVyLmdldChrZXkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvKipcbiAgICAgICAgICogUmV0dXJucyB0cnVlIGlmIHRoZSBnaXZlbiBvYmplY3QgaXMgYW4gb2JqZWN0IHdpdGggYSBgdGhlbmAgbWV0aG9kLCBhbmQgY2FuXG4gICAgICAgICAqIHRoZXJlZm9yZSBiZSBhc3N1bWVkIHRvIGJlaGF2ZSBhcyBhIFByb21pc2UuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHRlc3QuXG4gICAgICAgICAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHRoZSB2YWx1ZSBpcyB0aGVuYWJsZS5cbiAgICAgICAgICovXG5cbiAgICAgICAgY29uc3QgaXNUaGVuYWJsZSA9ICh2YWx1ZSkgPT4ge1xuICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICB2YWx1ZSAmJlxuICAgICAgICAgICAgdHlwZW9mIHZhbHVlID09PSBcIm9iamVjdFwiICYmXG4gICAgICAgICAgICB0eXBlb2YgdmFsdWUudGhlbiA9PT0gXCJmdW5jdGlvblwiXG4gICAgICAgICAgKTtcbiAgICAgICAgfTtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENyZWF0ZXMgYW5kIHJldHVybnMgYSBmdW5jdGlvbiB3aGljaCwgd2hlbiBjYWxsZWQsIHdpbGwgcmVzb2x2ZSBvciByZWplY3RcbiAgICAgICAgICogdGhlIGdpdmVuIHByb21pc2UgYmFzZWQgb24gaG93IGl0IGlzIGNhbGxlZDpcbiAgICAgICAgICpcbiAgICAgICAgICogLSBJZiwgd2hlbiBjYWxsZWQsIGBjaHJvbWUucnVudGltZS5sYXN0RXJyb3JgIGNvbnRhaW5zIGEgbm9uLW51bGwgb2JqZWN0LFxuICAgICAgICAgKiAgIHRoZSBwcm9taXNlIGlzIHJlamVjdGVkIHdpdGggdGhhdCB2YWx1ZS5cbiAgICAgICAgICogLSBJZiB0aGUgZnVuY3Rpb24gaXMgY2FsbGVkIHdpdGggZXhhY3RseSBvbmUgYXJndW1lbnQsIHRoZSBwcm9taXNlIGlzXG4gICAgICAgICAqICAgcmVzb2x2ZWQgdG8gdGhhdCB2YWx1ZS5cbiAgICAgICAgICogLSBPdGhlcndpc2UsIHRoZSBwcm9taXNlIGlzIHJlc29sdmVkIHRvIGFuIGFycmF5IGNvbnRhaW5pbmcgYWxsIG9mIHRoZVxuICAgICAgICAgKiAgIGZ1bmN0aW9uJ3MgYXJndW1lbnRzLlxuICAgICAgICAgKlxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gcHJvbWlzZVxuICAgICAgICAgKiAgICAgICAgQW4gb2JqZWN0IGNvbnRhaW5pbmcgdGhlIHJlc29sdXRpb24gYW5kIHJlamVjdGlvbiBmdW5jdGlvbnMgb2YgYVxuICAgICAgICAgKiAgICAgICAgcHJvbWlzZS5cbiAgICAgICAgICogQHBhcmFtIHtmdW5jdGlvbn0gcHJvbWlzZS5yZXNvbHZlXG4gICAgICAgICAqICAgICAgICBUaGUgcHJvbWlzZSdzIHJlc29sdXRpb24gZnVuY3Rpb24uXG4gICAgICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IHByb21pc2UucmVqZWN0XG4gICAgICAgICAqICAgICAgICBUaGUgcHJvbWlzZSdzIHJlamVjdGlvbiBmdW5jdGlvbi5cbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IG1ldGFkYXRhXG4gICAgICAgICAqICAgICAgICBNZXRhZGF0YSBhYm91dCB0aGUgd3JhcHBlZCBtZXRob2Qgd2hpY2ggaGFzIGNyZWF0ZWQgdGhlIGNhbGxiYWNrLlxuICAgICAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IG1ldGFkYXRhLnNpbmdsZUNhbGxiYWNrQXJnXG4gICAgICAgICAqICAgICAgICBXaGV0aGVyIG9yIG5vdCB0aGUgcHJvbWlzZSBpcyByZXNvbHZlZCB3aXRoIG9ubHkgdGhlIGZpcnN0XG4gICAgICAgICAqICAgICAgICBhcmd1bWVudCBvZiB0aGUgY2FsbGJhY2ssIGFsdGVybmF0aXZlbHkgYW4gYXJyYXkgb2YgYWxsIHRoZVxuICAgICAgICAgKiAgICAgICAgY2FsbGJhY2sgYXJndW1lbnRzIGlzIHJlc29sdmVkLiBCeSBkZWZhdWx0LCBpZiB0aGUgY2FsbGJhY2tcbiAgICAgICAgICogICAgICAgIGZ1bmN0aW9uIGlzIGludm9rZWQgd2l0aCBvbmx5IGEgc2luZ2xlIGFyZ3VtZW50LCB0aGF0IHdpbGwgYmVcbiAgICAgICAgICogICAgICAgIHJlc29sdmVkIHRvIHRoZSBwcm9taXNlLCB3aGlsZSBhbGwgYXJndW1lbnRzIHdpbGwgYmUgcmVzb2x2ZWQgYXNcbiAgICAgICAgICogICAgICAgIGFuIGFycmF5IGlmIG11bHRpcGxlIGFyZSBnaXZlbi5cbiAgICAgICAgICpcbiAgICAgICAgICogQHJldHVybnMge2Z1bmN0aW9ufVxuICAgICAgICAgKiAgICAgICAgVGhlIGdlbmVyYXRlZCBjYWxsYmFjayBmdW5jdGlvbi5cbiAgICAgICAgICovXG5cbiAgICAgICAgY29uc3QgbWFrZUNhbGxiYWNrID0gKHByb21pc2UsIG1ldGFkYXRhKSA9PiB7XG4gICAgICAgICAgcmV0dXJuICguLi5jYWxsYmFja0FyZ3MpID0+IHtcbiAgICAgICAgICAgIGlmIChleHRlbnNpb25BUElzLnJ1bnRpbWUubGFzdEVycm9yKSB7XG4gICAgICAgICAgICAgIHByb21pc2UucmVqZWN0KFxuICAgICAgICAgICAgICAgIG5ldyBFcnJvcihleHRlbnNpb25BUElzLnJ1bnRpbWUubGFzdEVycm9yLm1lc3NhZ2UpLFxuICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgICAgICAgbWV0YWRhdGEuc2luZ2xlQ2FsbGJhY2tBcmcgfHxcbiAgICAgICAgICAgICAgKGNhbGxiYWNrQXJncy5sZW5ndGggPD0gMSAmJiBtZXRhZGF0YS5zaW5nbGVDYWxsYmFja0FyZyAhPT0gZmFsc2UpXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgcHJvbWlzZS5yZXNvbHZlKGNhbGxiYWNrQXJnc1swXSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBwcm9taXNlLnJlc29sdmUoY2FsbGJhY2tBcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9O1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IHBsdXJhbGl6ZUFyZ3VtZW50cyA9IChudW1BcmdzKSA9PlxuICAgICAgICAgIG51bUFyZ3MgPT0gMSA/IFwiYXJndW1lbnRcIiA6IFwiYXJndW1lbnRzXCI7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDcmVhdGVzIGEgd3JhcHBlciBmdW5jdGlvbiBmb3IgYSBtZXRob2Qgd2l0aCB0aGUgZ2l2ZW4gbmFtZSBhbmQgbWV0YWRhdGEuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lXG4gICAgICAgICAqICAgICAgICBUaGUgbmFtZSBvZiB0aGUgbWV0aG9kIHdoaWNoIGlzIGJlaW5nIHdyYXBwZWQuXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBtZXRhZGF0YVxuICAgICAgICAgKiAgICAgICAgTWV0YWRhdGEgYWJvdXQgdGhlIG1ldGhvZCBiZWluZyB3cmFwcGVkLlxuICAgICAgICAgKiBAcGFyYW0ge2ludGVnZXJ9IG1ldGFkYXRhLm1pbkFyZ3NcbiAgICAgICAgICogICAgICAgIFRoZSBtaW5pbXVtIG51bWJlciBvZiBhcmd1bWVudHMgd2hpY2ggbXVzdCBiZSBwYXNzZWQgdG8gdGhlXG4gICAgICAgICAqICAgICAgICBmdW5jdGlvbi4gSWYgY2FsbGVkIHdpdGggZmV3ZXIgdGhhbiB0aGlzIG51bWJlciBvZiBhcmd1bWVudHMsIHRoZVxuICAgICAgICAgKiAgICAgICAgd3JhcHBlciB3aWxsIHJhaXNlIGFuIGV4Y2VwdGlvbi5cbiAgICAgICAgICogQHBhcmFtIHtpbnRlZ2VyfSBtZXRhZGF0YS5tYXhBcmdzXG4gICAgICAgICAqICAgICAgICBUaGUgbWF4aW11bSBudW1iZXIgb2YgYXJndW1lbnRzIHdoaWNoIG1heSBiZSBwYXNzZWQgdG8gdGhlXG4gICAgICAgICAqICAgICAgICBmdW5jdGlvbi4gSWYgY2FsbGVkIHdpdGggbW9yZSB0aGFuIHRoaXMgbnVtYmVyIG9mIGFyZ3VtZW50cywgdGhlXG4gICAgICAgICAqICAgICAgICB3cmFwcGVyIHdpbGwgcmFpc2UgYW4gZXhjZXB0aW9uLlxuICAgICAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IG1ldGFkYXRhLnNpbmdsZUNhbGxiYWNrQXJnXG4gICAgICAgICAqICAgICAgICBXaGV0aGVyIG9yIG5vdCB0aGUgcHJvbWlzZSBpcyByZXNvbHZlZCB3aXRoIG9ubHkgdGhlIGZpcnN0XG4gICAgICAgICAqICAgICAgICBhcmd1bWVudCBvZiB0aGUgY2FsbGJhY2ssIGFsdGVybmF0aXZlbHkgYW4gYXJyYXkgb2YgYWxsIHRoZVxuICAgICAgICAgKiAgICAgICAgY2FsbGJhY2sgYXJndW1lbnRzIGlzIHJlc29sdmVkLiBCeSBkZWZhdWx0LCBpZiB0aGUgY2FsbGJhY2tcbiAgICAgICAgICogICAgICAgIGZ1bmN0aW9uIGlzIGludm9rZWQgd2l0aCBvbmx5IGEgc2luZ2xlIGFyZ3VtZW50LCB0aGF0IHdpbGwgYmVcbiAgICAgICAgICogICAgICAgIHJlc29sdmVkIHRvIHRoZSBwcm9taXNlLCB3aGlsZSBhbGwgYXJndW1lbnRzIHdpbGwgYmUgcmVzb2x2ZWQgYXNcbiAgICAgICAgICogICAgICAgIGFuIGFycmF5IGlmIG11bHRpcGxlIGFyZSBnaXZlbi5cbiAgICAgICAgICpcbiAgICAgICAgICogQHJldHVybnMge2Z1bmN0aW9uKG9iamVjdCwgLi4uKil9XG4gICAgICAgICAqICAgICAgIFRoZSBnZW5lcmF0ZWQgd3JhcHBlciBmdW5jdGlvbi5cbiAgICAgICAgICovXG5cbiAgICAgICAgY29uc3Qgd3JhcEFzeW5jRnVuY3Rpb24gPSAobmFtZSwgbWV0YWRhdGEpID0+IHtcbiAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gYXN5bmNGdW5jdGlvbldyYXBwZXIodGFyZ2V0LCAuLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoYXJncy5sZW5ndGggPCBtZXRhZGF0YS5taW5BcmdzKSB7XG4gICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgICBgRXhwZWN0ZWQgYXQgbGVhc3QgJHttZXRhZGF0YS5taW5BcmdzfSAke3BsdXJhbGl6ZUFyZ3VtZW50cyhcbiAgICAgICAgICAgICAgICAgIG1ldGFkYXRhLm1pbkFyZ3MsXG4gICAgICAgICAgICAgICAgKX0gZm9yICR7bmFtZX0oKSwgZ290ICR7YXJncy5sZW5ndGh9YCxcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGFyZ3MubGVuZ3RoID4gbWV0YWRhdGEubWF4QXJncykge1xuICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgYEV4cGVjdGVkIGF0IG1vc3QgJHttZXRhZGF0YS5tYXhBcmdzfSAke3BsdXJhbGl6ZUFyZ3VtZW50cyhcbiAgICAgICAgICAgICAgICAgIG1ldGFkYXRhLm1heEFyZ3MsXG4gICAgICAgICAgICAgICAgKX0gZm9yICR7bmFtZX0oKSwgZ290ICR7YXJncy5sZW5ndGh9YCxcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgICAgaWYgKG1ldGFkYXRhLmZhbGxiYWNrVG9Ob0NhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgLy8gVGhpcyBBUEkgbWV0aG9kIGhhcyBjdXJyZW50bHkgbm8gY2FsbGJhY2sgb24gQ2hyb21lLCBidXQgaXQgcmV0dXJuIGEgcHJvbWlzZSBvbiBGaXJlZm94LFxuICAgICAgICAgICAgICAgIC8vIGFuZCBzbyB0aGUgcG9seWZpbGwgd2lsbCB0cnkgdG8gY2FsbCBpdCB3aXRoIGEgY2FsbGJhY2sgZmlyc3QsIGFuZCBpdCB3aWxsIGZhbGxiYWNrXG4gICAgICAgICAgICAgICAgLy8gdG8gbm90IHBhc3NpbmcgdGhlIGNhbGxiYWNrIGlmIHRoZSBmaXJzdCBjYWxsIGZhaWxzLlxuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICB0YXJnZXRbbmFtZV0oXG4gICAgICAgICAgICAgICAgICAgIC4uLmFyZ3MsXG4gICAgICAgICAgICAgICAgICAgIG1ha2VDYWxsYmFjayhcbiAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0LFxuICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgbWV0YWRhdGEsXG4gICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGNiRXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgICAgICAgICAgICAgYCR7bmFtZX0gQVBJIG1ldGhvZCBkb2Vzbid0IHNlZW0gdG8gc3VwcG9ydCB0aGUgY2FsbGJhY2sgcGFyYW1ldGVyLCBgICtcbiAgICAgICAgICAgICAgICAgICAgICBcImZhbGxpbmcgYmFjayB0byBjYWxsIGl0IHdpdGhvdXQgYSBjYWxsYmFjazogXCIsXG4gICAgICAgICAgICAgICAgICAgIGNiRXJyb3IsXG4gICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgdGFyZ2V0W25hbWVdKC4uLmFyZ3MpOyAvLyBVcGRhdGUgdGhlIEFQSSBtZXRob2QgbWV0YWRhdGEsIHNvIHRoYXQgdGhlIG5leHQgQVBJIGNhbGxzIHdpbGwgbm90IHRyeSB0b1xuICAgICAgICAgICAgICAgICAgLy8gdXNlIHRoZSB1bnN1cHBvcnRlZCBjYWxsYmFjayBhbnltb3JlLlxuXG4gICAgICAgICAgICAgICAgICBtZXRhZGF0YS5mYWxsYmFja1RvTm9DYWxsYmFjayA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgbWV0YWRhdGEubm9DYWxsYmFjayA9IHRydWU7XG4gICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9IGVsc2UgaWYgKG1ldGFkYXRhLm5vQ2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICB0YXJnZXRbbmFtZV0oLi4uYXJncyk7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRhcmdldFtuYW1lXShcbiAgICAgICAgICAgICAgICAgIC4uLmFyZ3MsXG4gICAgICAgICAgICAgICAgICBtYWtlQ2FsbGJhY2soXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlLFxuICAgICAgICAgICAgICAgICAgICAgIHJlamVjdCxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgbWV0YWRhdGEsXG4gICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH07XG4gICAgICAgIH07XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBXcmFwcyBhbiBleGlzdGluZyBtZXRob2Qgb2YgdGhlIHRhcmdldCBvYmplY3QsIHNvIHRoYXQgY2FsbHMgdG8gaXQgYXJlXG4gICAgICAgICAqIGludGVyY2VwdGVkIGJ5IHRoZSBnaXZlbiB3cmFwcGVyIGZ1bmN0aW9uLiBUaGUgd3JhcHBlciBmdW5jdGlvbiByZWNlaXZlcyxcbiAgICAgICAgICogYXMgaXRzIGZpcnN0IGFyZ3VtZW50LCB0aGUgb3JpZ2luYWwgYHRhcmdldGAgb2JqZWN0LCBmb2xsb3dlZCBieSBlYWNoIG9mXG4gICAgICAgICAqIHRoZSBhcmd1bWVudHMgcGFzc2VkIHRvIHRoZSBvcmlnaW5hbCBtZXRob2QuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0YXJnZXRcbiAgICAgICAgICogICAgICAgIFRoZSBvcmlnaW5hbCB0YXJnZXQgb2JqZWN0IHRoYXQgdGhlIHdyYXBwZWQgbWV0aG9kIGJlbG9uZ3MgdG8uXG4gICAgICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IG1ldGhvZFxuICAgICAgICAgKiAgICAgICAgVGhlIG1ldGhvZCBiZWluZyB3cmFwcGVkLiBUaGlzIGlzIHVzZWQgYXMgdGhlIHRhcmdldCBvZiB0aGUgUHJveHlcbiAgICAgICAgICogICAgICAgIG9iamVjdCB3aGljaCBpcyBjcmVhdGVkIHRvIHdyYXAgdGhlIG1ldGhvZC5cbiAgICAgICAgICogQHBhcmFtIHtmdW5jdGlvbn0gd3JhcHBlclxuICAgICAgICAgKiAgICAgICAgVGhlIHdyYXBwZXIgZnVuY3Rpb24gd2hpY2ggaXMgY2FsbGVkIGluIHBsYWNlIG9mIGEgZGlyZWN0IGludm9jYXRpb25cbiAgICAgICAgICogICAgICAgIG9mIHRoZSB3cmFwcGVkIG1ldGhvZC5cbiAgICAgICAgICpcbiAgICAgICAgICogQHJldHVybnMge1Byb3h5PGZ1bmN0aW9uPn1cbiAgICAgICAgICogICAgICAgIEEgUHJveHkgb2JqZWN0IGZvciB0aGUgZ2l2ZW4gbWV0aG9kLCB3aGljaCBpbnZva2VzIHRoZSBnaXZlbiB3cmFwcGVyXG4gICAgICAgICAqICAgICAgICBtZXRob2QgaW4gaXRzIHBsYWNlLlxuICAgICAgICAgKi9cblxuICAgICAgICBjb25zdCB3cmFwTWV0aG9kID0gKHRhcmdldCwgbWV0aG9kLCB3cmFwcGVyKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIG5ldyBQcm94eShtZXRob2QsIHtcbiAgICAgICAgICAgIGFwcGx5KHRhcmdldE1ldGhvZCwgdGhpc09iaiwgYXJncykge1xuICAgICAgICAgICAgICByZXR1cm4gd3JhcHBlci5jYWxsKHRoaXNPYmosIHRhcmdldCwgLi4uYXJncyk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIGxldCBoYXNPd25Qcm9wZXJ0eSA9IEZ1bmN0aW9uLmNhbGwuYmluZChcbiAgICAgICAgICBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LFxuICAgICAgICApO1xuICAgICAgICAvKipcbiAgICAgICAgICogV3JhcHMgYW4gb2JqZWN0IGluIGEgUHJveHkgd2hpY2ggaW50ZXJjZXB0cyBhbmQgd3JhcHMgY2VydGFpbiBtZXRob2RzXG4gICAgICAgICAqIGJhc2VkIG9uIHRoZSBnaXZlbiBgd3JhcHBlcnNgIGFuZCBgbWV0YWRhdGFgIG9iamVjdHMuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0YXJnZXRcbiAgICAgICAgICogICAgICAgIFRoZSB0YXJnZXQgb2JqZWN0IHRvIHdyYXAuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbd3JhcHBlcnMgPSB7fV1cbiAgICAgICAgICogICAgICAgIEFuIG9iamVjdCB0cmVlIGNvbnRhaW5pbmcgd3JhcHBlciBmdW5jdGlvbnMgZm9yIHNwZWNpYWwgY2FzZXMuIEFueVxuICAgICAgICAgKiAgICAgICAgZnVuY3Rpb24gcHJlc2VudCBpbiB0aGlzIG9iamVjdCB0cmVlIGlzIGNhbGxlZCBpbiBwbGFjZSBvZiB0aGVcbiAgICAgICAgICogICAgICAgIG1ldGhvZCBpbiB0aGUgc2FtZSBsb2NhdGlvbiBpbiB0aGUgYHRhcmdldGAgb2JqZWN0IHRyZWUuIFRoZXNlXG4gICAgICAgICAqICAgICAgICB3cmFwcGVyIG1ldGhvZHMgYXJlIGludm9rZWQgYXMgZGVzY3JpYmVkIGluIHtAc2VlIHdyYXBNZXRob2R9LlxuICAgICAgICAgKlxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gW21ldGFkYXRhID0ge31dXG4gICAgICAgICAqICAgICAgICBBbiBvYmplY3QgdHJlZSBjb250YWluaW5nIG1ldGFkYXRhIHVzZWQgdG8gYXV0b21hdGljYWxseSBnZW5lcmF0ZVxuICAgICAgICAgKiAgICAgICAgUHJvbWlzZS1iYXNlZCB3cmFwcGVyIGZ1bmN0aW9ucyBmb3IgYXN5bmNocm9ub3VzLiBBbnkgZnVuY3Rpb24gaW5cbiAgICAgICAgICogICAgICAgIHRoZSBgdGFyZ2V0YCBvYmplY3QgdHJlZSB3aGljaCBoYXMgYSBjb3JyZXNwb25kaW5nIG1ldGFkYXRhIG9iamVjdFxuICAgICAgICAgKiAgICAgICAgaW4gdGhlIHNhbWUgbG9jYXRpb24gaW4gdGhlIGBtZXRhZGF0YWAgdHJlZSBpcyByZXBsYWNlZCB3aXRoIGFuXG4gICAgICAgICAqICAgICAgICBhdXRvbWF0aWNhbGx5LWdlbmVyYXRlZCB3cmFwcGVyIGZ1bmN0aW9uLCBhcyBkZXNjcmliZWQgaW5cbiAgICAgICAgICogICAgICAgIHtAc2VlIHdyYXBBc3luY0Z1bmN0aW9ufVxuICAgICAgICAgKlxuICAgICAgICAgKiBAcmV0dXJucyB7UHJveHk8b2JqZWN0Pn1cbiAgICAgICAgICovXG5cbiAgICAgICAgY29uc3Qgd3JhcE9iamVjdCA9ICh0YXJnZXQsIHdyYXBwZXJzID0ge30sIG1ldGFkYXRhID0ge30pID0+IHtcbiAgICAgICAgICBsZXQgY2FjaGUgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgICAgICAgIGxldCBoYW5kbGVycyA9IHtcbiAgICAgICAgICAgIGhhcyhwcm94eVRhcmdldCwgcHJvcCkge1xuICAgICAgICAgICAgICByZXR1cm4gcHJvcCBpbiB0YXJnZXQgfHwgcHJvcCBpbiBjYWNoZTtcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIGdldChwcm94eVRhcmdldCwgcHJvcCwgcmVjZWl2ZXIpIHtcbiAgICAgICAgICAgICAgaWYgKHByb3AgaW4gY2FjaGUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2FjaGVbcHJvcF07XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBpZiAoIShwcm9wIGluIHRhcmdldCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgbGV0IHZhbHVlID0gdGFyZ2V0W3Byb3BdO1xuXG4gICAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgICAgIC8vIFRoaXMgaXMgYSBtZXRob2Qgb24gdGhlIHVuZGVybHlpbmcgb2JqZWN0LiBDaGVjayBpZiB3ZSBuZWVkIHRvIGRvXG4gICAgICAgICAgICAgICAgLy8gYW55IHdyYXBwaW5nLlxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2Ygd3JhcHBlcnNbcHJvcF0gPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgICAgICAgLy8gV2UgaGF2ZSBhIHNwZWNpYWwtY2FzZSB3cmFwcGVyIGZvciB0aGlzIG1ldGhvZC5cbiAgICAgICAgICAgICAgICAgIHZhbHVlID0gd3JhcE1ldGhvZCh0YXJnZXQsIHRhcmdldFtwcm9wXSwgd3JhcHBlcnNbcHJvcF0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoaGFzT3duUHJvcGVydHkobWV0YWRhdGEsIHByb3ApKSB7XG4gICAgICAgICAgICAgICAgICAvLyBUaGlzIGlzIGFuIGFzeW5jIG1ldGhvZCB0aGF0IHdlIGhhdmUgbWV0YWRhdGEgZm9yLiBDcmVhdGUgYVxuICAgICAgICAgICAgICAgICAgLy8gUHJvbWlzZSB3cmFwcGVyIGZvciBpdC5cbiAgICAgICAgICAgICAgICAgIGxldCB3cmFwcGVyID0gd3JhcEFzeW5jRnVuY3Rpb24ocHJvcCwgbWV0YWRhdGFbcHJvcF0pO1xuICAgICAgICAgICAgICAgICAgdmFsdWUgPSB3cmFwTWV0aG9kKHRhcmdldCwgdGFyZ2V0W3Byb3BdLCB3cmFwcGVyKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgLy8gVGhpcyBpcyBhIG1ldGhvZCB0aGF0IHdlIGRvbid0IGtub3cgb3IgY2FyZSBhYm91dC4gUmV0dXJuIHRoZVxuICAgICAgICAgICAgICAgICAgLy8gb3JpZ2luYWwgbWV0aG9kLCBib3VuZCB0byB0aGUgdW5kZXJseWluZyBvYmplY3QuXG4gICAgICAgICAgICAgICAgICB2YWx1ZSA9IHZhbHVlLmJpbmQodGFyZ2V0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgICAgICAgICAgdHlwZW9mIHZhbHVlID09PSBcIm9iamVjdFwiICYmXG4gICAgICAgICAgICAgICAgdmFsdWUgIT09IG51bGwgJiZcbiAgICAgICAgICAgICAgICAoaGFzT3duUHJvcGVydHkod3JhcHBlcnMsIHByb3ApIHx8XG4gICAgICAgICAgICAgICAgICBoYXNPd25Qcm9wZXJ0eShtZXRhZGF0YSwgcHJvcCkpXG4gICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIC8vIFRoaXMgaXMgYW4gb2JqZWN0IHRoYXQgd2UgbmVlZCB0byBkbyBzb21lIHdyYXBwaW5nIGZvciB0aGUgY2hpbGRyZW5cbiAgICAgICAgICAgICAgICAvLyBvZi4gQ3JlYXRlIGEgc3ViLW9iamVjdCB3cmFwcGVyIGZvciBpdCB3aXRoIHRoZSBhcHByb3ByaWF0ZSBjaGlsZFxuICAgICAgICAgICAgICAgIC8vIG1ldGFkYXRhLlxuICAgICAgICAgICAgICAgIHZhbHVlID0gd3JhcE9iamVjdCh2YWx1ZSwgd3JhcHBlcnNbcHJvcF0sIG1ldGFkYXRhW3Byb3BdKTtcbiAgICAgICAgICAgICAgfSBlbHNlIGlmIChoYXNPd25Qcm9wZXJ0eShtZXRhZGF0YSwgXCIqXCIpKSB7XG4gICAgICAgICAgICAgICAgLy8gV3JhcCBhbGwgcHJvcGVydGllcyBpbiAqIG5hbWVzcGFjZS5cbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHdyYXBPYmplY3QodmFsdWUsIHdyYXBwZXJzW3Byb3BdLCBtZXRhZGF0YVtcIipcIl0pO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIFdlIGRvbid0IG5lZWQgdG8gZG8gYW55IHdyYXBwaW5nIGZvciB0aGlzIHByb3BlcnR5LFxuICAgICAgICAgICAgICAgIC8vIHNvIGp1c3QgZm9yd2FyZCBhbGwgYWNjZXNzIHRvIHRoZSB1bmRlcmx5aW5nIG9iamVjdC5cbiAgICAgICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoY2FjaGUsIHByb3AsIHtcbiAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG5cbiAgICAgICAgICAgICAgICAgIGdldCgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRhcmdldFtwcm9wXTtcbiAgICAgICAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgICAgICAgIHNldCh2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICB0YXJnZXRbcHJvcF0gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgY2FjaGVbcHJvcF0gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgc2V0KHByb3h5VGFyZ2V0LCBwcm9wLCB2YWx1ZSwgcmVjZWl2ZXIpIHtcbiAgICAgICAgICAgICAgaWYgKHByb3AgaW4gY2FjaGUpIHtcbiAgICAgICAgICAgICAgICBjYWNoZVtwcm9wXSA9IHZhbHVlO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRhcmdldFtwcm9wXSA9IHZhbHVlO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBkZWZpbmVQcm9wZXJ0eShwcm94eVRhcmdldCwgcHJvcCwgZGVzYykge1xuICAgICAgICAgICAgICByZXR1cm4gUmVmbGVjdC5kZWZpbmVQcm9wZXJ0eShjYWNoZSwgcHJvcCwgZGVzYyk7XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBkZWxldGVQcm9wZXJ0eShwcm94eVRhcmdldCwgcHJvcCkge1xuICAgICAgICAgICAgICByZXR1cm4gUmVmbGVjdC5kZWxldGVQcm9wZXJ0eShjYWNoZSwgcHJvcCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH07IC8vIFBlciBjb250cmFjdCBvZiB0aGUgUHJveHkgQVBJLCB0aGUgXCJnZXRcIiBwcm94eSBoYW5kbGVyIG11c3QgcmV0dXJuIHRoZVxuICAgICAgICAgIC8vIG9yaWdpbmFsIHZhbHVlIG9mIHRoZSB0YXJnZXQgaWYgdGhhdCB2YWx1ZSBpcyBkZWNsYXJlZCByZWFkLW9ubHkgYW5kXG4gICAgICAgICAgLy8gbm9uLWNvbmZpZ3VyYWJsZS4gRm9yIHRoaXMgcmVhc29uLCB3ZSBjcmVhdGUgYW4gb2JqZWN0IHdpdGggdGhlXG4gICAgICAgICAgLy8gcHJvdG90eXBlIHNldCB0byBgdGFyZ2V0YCBpbnN0ZWFkIG9mIHVzaW5nIGB0YXJnZXRgIGRpcmVjdGx5LlxuICAgICAgICAgIC8vIE90aGVyd2lzZSB3ZSBjYW5ub3QgcmV0dXJuIGEgY3VzdG9tIG9iamVjdCBmb3IgQVBJcyB0aGF0XG4gICAgICAgICAgLy8gYXJlIGRlY2xhcmVkIHJlYWQtb25seSBhbmQgbm9uLWNvbmZpZ3VyYWJsZSwgc3VjaCBhcyBgY2hyb21lLmRldnRvb2xzYC5cbiAgICAgICAgICAvL1xuICAgICAgICAgIC8vIFRoZSBwcm94eSBoYW5kbGVycyB0aGVtc2VsdmVzIHdpbGwgc3RpbGwgdXNlIHRoZSBvcmlnaW5hbCBgdGFyZ2V0YFxuICAgICAgICAgIC8vIGluc3RlYWQgb2YgdGhlIGBwcm94eVRhcmdldGAsIHNvIHRoYXQgdGhlIG1ldGhvZHMgYW5kIHByb3BlcnRpZXMgYXJlXG4gICAgICAgICAgLy8gZGVyZWZlcmVuY2VkIHZpYSB0aGUgb3JpZ2luYWwgdGFyZ2V0cy5cblxuICAgICAgICAgIGxldCBwcm94eVRhcmdldCA9IE9iamVjdC5jcmVhdGUodGFyZ2V0KTtcbiAgICAgICAgICByZXR1cm4gbmV3IFByb3h5KHByb3h5VGFyZ2V0LCBoYW5kbGVycyk7XG4gICAgICAgIH07XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDcmVhdGVzIGEgc2V0IG9mIHdyYXBwZXIgZnVuY3Rpb25zIGZvciBhbiBldmVudCBvYmplY3QsIHdoaWNoIGhhbmRsZXNcbiAgICAgICAgICogd3JhcHBpbmcgb2YgbGlzdGVuZXIgZnVuY3Rpb25zIHRoYXQgdGhvc2UgbWVzc2FnZXMgYXJlIHBhc3NlZC5cbiAgICAgICAgICpcbiAgICAgICAgICogQSBzaW5nbGUgd3JhcHBlciBpcyBjcmVhdGVkIGZvciBlYWNoIGxpc3RlbmVyIGZ1bmN0aW9uLCBhbmQgc3RvcmVkIGluIGFcbiAgICAgICAgICogbWFwLiBTdWJzZXF1ZW50IGNhbGxzIHRvIGBhZGRMaXN0ZW5lcmAsIGBoYXNMaXN0ZW5lcmAsIG9yIGByZW1vdmVMaXN0ZW5lcmBcbiAgICAgICAgICogcmV0cmlldmUgdGhlIG9yaWdpbmFsIHdyYXBwZXIsIHNvIHRoYXQgIGF0dGVtcHRzIHRvIHJlbW92ZSBhXG4gICAgICAgICAqIHByZXZpb3VzbHktYWRkZWQgbGlzdGVuZXIgd29yayBhcyBleHBlY3RlZC5cbiAgICAgICAgICpcbiAgICAgICAgICogQHBhcmFtIHtEZWZhdWx0V2Vha01hcDxmdW5jdGlvbiwgZnVuY3Rpb24+fSB3cmFwcGVyTWFwXG4gICAgICAgICAqICAgICAgICBBIERlZmF1bHRXZWFrTWFwIG9iamVjdCB3aGljaCB3aWxsIGNyZWF0ZSB0aGUgYXBwcm9wcmlhdGUgd3JhcHBlclxuICAgICAgICAgKiAgICAgICAgZm9yIGEgZ2l2ZW4gbGlzdGVuZXIgZnVuY3Rpb24gd2hlbiBvbmUgZG9lcyBub3QgZXhpc3QsIGFuZCByZXRyaWV2ZVxuICAgICAgICAgKiAgICAgICAgYW4gZXhpc3Rpbmcgb25lIHdoZW4gaXQgZG9lcy5cbiAgICAgICAgICpcbiAgICAgICAgICogQHJldHVybnMge29iamVjdH1cbiAgICAgICAgICovXG5cbiAgICAgICAgY29uc3Qgd3JhcEV2ZW50ID0gKHdyYXBwZXJNYXApID0+ICh7XG4gICAgICAgICAgYWRkTGlzdGVuZXIodGFyZ2V0LCBsaXN0ZW5lciwgLi4uYXJncykge1xuICAgICAgICAgICAgdGFyZ2V0LmFkZExpc3RlbmVyKHdyYXBwZXJNYXAuZ2V0KGxpc3RlbmVyKSwgLi4uYXJncyk7XG4gICAgICAgICAgfSxcblxuICAgICAgICAgIGhhc0xpc3RlbmVyKHRhcmdldCwgbGlzdGVuZXIpIHtcbiAgICAgICAgICAgIHJldHVybiB0YXJnZXQuaGFzTGlzdGVuZXIod3JhcHBlck1hcC5nZXQobGlzdGVuZXIpKTtcbiAgICAgICAgICB9LFxuXG4gICAgICAgICAgcmVtb3ZlTGlzdGVuZXIodGFyZ2V0LCBsaXN0ZW5lcikge1xuICAgICAgICAgICAgdGFyZ2V0LnJlbW92ZUxpc3RlbmVyKHdyYXBwZXJNYXAuZ2V0KGxpc3RlbmVyKSk7XG4gICAgICAgICAgfSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3Qgb25SZXF1ZXN0RmluaXNoZWRXcmFwcGVycyA9IG5ldyBEZWZhdWx0V2Vha01hcCgobGlzdGVuZXIpID0+IHtcbiAgICAgICAgICBpZiAodHlwZW9mIGxpc3RlbmVyICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIHJldHVybiBsaXN0ZW5lcjtcbiAgICAgICAgICB9XG4gICAgICAgICAgLyoqXG4gICAgICAgICAgICogV3JhcHMgYW4gb25SZXF1ZXN0RmluaXNoZWQgbGlzdGVuZXIgZnVuY3Rpb24gc28gdGhhdCBpdCB3aWxsIHJldHVybiBhXG4gICAgICAgICAgICogYGdldENvbnRlbnQoKWAgcHJvcGVydHkgd2hpY2ggcmV0dXJucyBhIGBQcm9taXNlYCByYXRoZXIgdGhhbiB1c2luZyBhXG4gICAgICAgICAgICogY2FsbGJhY2sgQVBJLlxuICAgICAgICAgICAqXG4gICAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IHJlcVxuICAgICAgICAgICAqICAgICAgICBUaGUgSEFSIGVudHJ5IG9iamVjdCByZXByZXNlbnRpbmcgdGhlIG5ldHdvcmsgcmVxdWVzdC5cbiAgICAgICAgICAgKi9cblxuICAgICAgICAgIHJldHVybiBmdW5jdGlvbiBvblJlcXVlc3RGaW5pc2hlZChyZXEpIHtcbiAgICAgICAgICAgIGNvbnN0IHdyYXBwZWRSZXEgPSB3cmFwT2JqZWN0KFxuICAgICAgICAgICAgICByZXEsXG4gICAgICAgICAgICAgIHt9LFxuICAgICAgICAgICAgICAvKiB3cmFwcGVycyAqL1xuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgZ2V0Q29udGVudDoge1xuICAgICAgICAgICAgICAgICAgbWluQXJnczogMCxcbiAgICAgICAgICAgICAgICAgIG1heEFyZ3M6IDAsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBsaXN0ZW5lcih3cmFwcGVkUmVxKTtcbiAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICAgICAgY29uc3Qgb25NZXNzYWdlV3JhcHBlcnMgPSBuZXcgRGVmYXVsdFdlYWtNYXAoKGxpc3RlbmVyKSA9PiB7XG4gICAgICAgICAgaWYgKHR5cGVvZiBsaXN0ZW5lciAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICByZXR1cm4gbGlzdGVuZXI7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8qKlxuICAgICAgICAgICAqIFdyYXBzIGEgbWVzc2FnZSBsaXN0ZW5lciBmdW5jdGlvbiBzbyB0aGF0IGl0IG1heSBzZW5kIHJlc3BvbnNlcyBiYXNlZCBvblxuICAgICAgICAgICAqIGl0cyByZXR1cm4gdmFsdWUsIHJhdGhlciB0aGFuIGJ5IHJldHVybmluZyBhIHNlbnRpbmVsIHZhbHVlIGFuZCBjYWxsaW5nIGFcbiAgICAgICAgICAgKiBjYWxsYmFjay4gSWYgdGhlIGxpc3RlbmVyIGZ1bmN0aW9uIHJldHVybnMgYSBQcm9taXNlLCB0aGUgcmVzcG9uc2UgaXNcbiAgICAgICAgICAgKiBzZW50IHdoZW4gdGhlIHByb21pc2UgZWl0aGVyIHJlc29sdmVzIG9yIHJlamVjdHMuXG4gICAgICAgICAgICpcbiAgICAgICAgICAgKiBAcGFyYW0geyp9IG1lc3NhZ2VcbiAgICAgICAgICAgKiAgICAgICAgVGhlIG1lc3NhZ2Ugc2VudCBieSB0aGUgb3RoZXIgZW5kIG9mIHRoZSBjaGFubmVsLlxuICAgICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBzZW5kZXJcbiAgICAgICAgICAgKiAgICAgICAgRGV0YWlscyBhYm91dCB0aGUgc2VuZGVyIG9mIHRoZSBtZXNzYWdlLlxuICAgICAgICAgICAqIEBwYXJhbSB7ZnVuY3Rpb24oKil9IHNlbmRSZXNwb25zZVxuICAgICAgICAgICAqICAgICAgICBBIGNhbGxiYWNrIHdoaWNoLCB3aGVuIGNhbGxlZCB3aXRoIGFuIGFyYml0cmFyeSBhcmd1bWVudCwgc2VuZHNcbiAgICAgICAgICAgKiAgICAgICAgdGhhdCB2YWx1ZSBhcyBhIHJlc3BvbnNlLlxuICAgICAgICAgICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgICAgICAgICAqICAgICAgICBUcnVlIGlmIHRoZSB3cmFwcGVkIGxpc3RlbmVyIHJldHVybmVkIGEgUHJvbWlzZSwgd2hpY2ggd2lsbCBsYXRlclxuICAgICAgICAgICAqICAgICAgICB5aWVsZCBhIHJlc3BvbnNlLiBGYWxzZSBvdGhlcndpc2UuXG4gICAgICAgICAgICovXG5cbiAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gb25NZXNzYWdlKG1lc3NhZ2UsIHNlbmRlciwgc2VuZFJlc3BvbnNlKSB7XG4gICAgICAgICAgICBsZXQgZGlkQ2FsbFNlbmRSZXNwb25zZSA9IGZhbHNlO1xuICAgICAgICAgICAgbGV0IHdyYXBwZWRTZW5kUmVzcG9uc2U7XG4gICAgICAgICAgICBsZXQgc2VuZFJlc3BvbnNlUHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICAgIHdyYXBwZWRTZW5kUmVzcG9uc2UgPSBmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICBkaWRDYWxsU2VuZFJlc3BvbnNlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgbGV0IHJlc3VsdDtcblxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgcmVzdWx0ID0gbGlzdGVuZXIobWVzc2FnZSwgc2VuZGVyLCB3cmFwcGVkU2VuZFJlc3BvbnNlKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICByZXN1bHQgPSBQcm9taXNlLnJlamVjdChlcnIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBpc1Jlc3VsdFRoZW5hYmxlID0gcmVzdWx0ICE9PSB0cnVlICYmIGlzVGhlbmFibGUocmVzdWx0KTsgLy8gSWYgdGhlIGxpc3RlbmVyIGRpZG4ndCByZXR1cm5lZCB0cnVlIG9yIGEgUHJvbWlzZSwgb3IgY2FsbGVkXG4gICAgICAgICAgICAvLyB3cmFwcGVkU2VuZFJlc3BvbnNlIHN5bmNocm9ub3VzbHksIHdlIGNhbiBleGl0IGVhcmxpZXJcbiAgICAgICAgICAgIC8vIGJlY2F1c2UgdGhlcmUgd2lsbCBiZSBubyByZXNwb25zZSBzZW50IGZyb20gdGhpcyBsaXN0ZW5lci5cblxuICAgICAgICAgICAgaWYgKHJlc3VsdCAhPT0gdHJ1ZSAmJiAhaXNSZXN1bHRUaGVuYWJsZSAmJiAhZGlkQ2FsbFNlbmRSZXNwb25zZSkge1xuICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9IC8vIEEgc21hbGwgaGVscGVyIHRvIHNlbmQgdGhlIG1lc3NhZ2UgaWYgdGhlIHByb21pc2UgcmVzb2x2ZXNcbiAgICAgICAgICAgIC8vIGFuZCBhbiBlcnJvciBpZiB0aGUgcHJvbWlzZSByZWplY3RzIChhIHdyYXBwZWQgc2VuZE1lc3NhZ2UgaGFzXG4gICAgICAgICAgICAvLyB0byB0cmFuc2xhdGUgdGhlIG1lc3NhZ2UgaW50byBhIHJlc29sdmVkIHByb21pc2Ugb3IgYSByZWplY3RlZFxuICAgICAgICAgICAgLy8gcHJvbWlzZSkuXG5cbiAgICAgICAgICAgIGNvbnN0IHNlbmRQcm9taXNlZFJlc3VsdCA9IChwcm9taXNlKSA9PiB7XG4gICAgICAgICAgICAgIHByb21pc2VcbiAgICAgICAgICAgICAgICAudGhlbihcbiAgICAgICAgICAgICAgICAgIChtc2cpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gc2VuZCB0aGUgbWVzc2FnZSB2YWx1ZS5cbiAgICAgICAgICAgICAgICAgICAgc2VuZFJlc3BvbnNlKG1zZyk7XG4gICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgKGVycm9yKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFNlbmQgYSBKU09OIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBlcnJvciBpZiB0aGUgcmVqZWN0ZWQgdmFsdWVcbiAgICAgICAgICAgICAgICAgICAgLy8gaXMgYW4gaW5zdGFuY2Ugb2YgZXJyb3IsIG9yIHRoZSBvYmplY3QgaXRzZWxmIG90aGVyd2lzZS5cbiAgICAgICAgICAgICAgICAgICAgbGV0IG1lc3NhZ2U7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgIGVycm9yICYmXG4gICAgICAgICAgICAgICAgICAgICAgKGVycm9yIGluc3RhbmNlb2YgRXJyb3IgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGVvZiBlcnJvci5tZXNzYWdlID09PSBcInN0cmluZ1wiKVxuICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlID0gZXJyb3IubWVzc2FnZTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlID0gXCJBbiB1bmV4cGVjdGVkIGVycm9yIG9jY3VycmVkXCI7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBzZW5kUmVzcG9uc2Uoe1xuICAgICAgICAgICAgICAgICAgICAgIF9fbW96V2ViRXh0ZW5zaW9uUG9seWZpbGxSZWplY3RfXzogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAvLyBQcmludCBhbiBlcnJvciBvbiB0aGUgY29uc29sZSBpZiB1bmFibGUgdG8gc2VuZCB0aGUgcmVzcG9uc2UuXG4gICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiRmFpbGVkIHRvIHNlbmQgb25NZXNzYWdlIHJlamVjdGVkIHJlcGx5XCIsIGVycik7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9OyAvLyBJZiB0aGUgbGlzdGVuZXIgcmV0dXJuZWQgYSBQcm9taXNlLCBzZW5kIHRoZSByZXNvbHZlZCB2YWx1ZSBhcyBhXG4gICAgICAgICAgICAvLyByZXN1bHQsIG90aGVyd2lzZSB3YWl0IHRoZSBwcm9taXNlIHJlbGF0ZWQgdG8gdGhlIHdyYXBwZWRTZW5kUmVzcG9uc2VcbiAgICAgICAgICAgIC8vIGNhbGxiYWNrIHRvIHJlc29sdmUgYW5kIHNlbmQgaXQgYXMgYSByZXNwb25zZS5cblxuICAgICAgICAgICAgaWYgKGlzUmVzdWx0VGhlbmFibGUpIHtcbiAgICAgICAgICAgICAgc2VuZFByb21pc2VkUmVzdWx0KHJlc3VsdCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBzZW5kUHJvbWlzZWRSZXN1bHQoc2VuZFJlc3BvbnNlUHJvbWlzZSk7XG4gICAgICAgICAgICB9IC8vIExldCBDaHJvbWUga25vdyB0aGF0IHRoZSBsaXN0ZW5lciBpcyByZXBseWluZy5cblxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3Qgd3JhcHBlZFNlbmRNZXNzYWdlQ2FsbGJhY2sgPSAoeyByZWplY3QsIHJlc29sdmUgfSwgcmVwbHkpID0+IHtcbiAgICAgICAgICBpZiAoZXh0ZW5zaW9uQVBJcy5ydW50aW1lLmxhc3RFcnJvcikge1xuICAgICAgICAgICAgLy8gRGV0ZWN0IHdoZW4gbm9uZSBvZiB0aGUgbGlzdGVuZXJzIHJlcGxpZWQgdG8gdGhlIHNlbmRNZXNzYWdlIGNhbGwgYW5kIHJlc29sdmVcbiAgICAgICAgICAgIC8vIHRoZSBwcm9taXNlIHRvIHVuZGVmaW5lZCBhcyBpbiBGaXJlZm94LlxuICAgICAgICAgICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9tb3ppbGxhL3dlYmV4dGVuc2lvbi1wb2x5ZmlsbC9pc3N1ZXMvMTMwXG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgIGV4dGVuc2lvbkFQSXMucnVudGltZS5sYXN0RXJyb3IubWVzc2FnZSA9PT1cbiAgICAgICAgICAgICAgQ0hST01FX1NFTkRfTUVTU0FHRV9DQUxMQkFDS19OT19SRVNQT05TRV9NRVNTQUdFXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihleHRlbnNpb25BUElzLnJ1bnRpbWUubGFzdEVycm9yLm1lc3NhZ2UpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2UgaWYgKHJlcGx5ICYmIHJlcGx5Ll9fbW96V2ViRXh0ZW5zaW9uUG9seWZpbGxSZWplY3RfXykge1xuICAgICAgICAgICAgLy8gQ29udmVydCBiYWNrIHRoZSBKU09OIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBlcnJvciBpbnRvXG4gICAgICAgICAgICAvLyBhbiBFcnJvciBpbnN0YW5jZS5cbiAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IocmVwbHkubWVzc2FnZSkpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXNvbHZlKHJlcGx5KTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3Qgd3JhcHBlZFNlbmRNZXNzYWdlID0gKFxuICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgbWV0YWRhdGEsXG4gICAgICAgICAgYXBpTmFtZXNwYWNlT2JqLFxuICAgICAgICAgIC4uLmFyZ3NcbiAgICAgICAgKSA9PiB7XG4gICAgICAgICAgaWYgKGFyZ3MubGVuZ3RoIDwgbWV0YWRhdGEubWluQXJncykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICBgRXhwZWN0ZWQgYXQgbGVhc3QgJHttZXRhZGF0YS5taW5BcmdzfSAke3BsdXJhbGl6ZUFyZ3VtZW50cyhcbiAgICAgICAgICAgICAgICBtZXRhZGF0YS5taW5BcmdzLFxuICAgICAgICAgICAgICApfSBmb3IgJHtuYW1lfSgpLCBnb3QgJHthcmdzLmxlbmd0aH1gLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoYXJncy5sZW5ndGggPiBtZXRhZGF0YS5tYXhBcmdzKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgIGBFeHBlY3RlZCBhdCBtb3N0ICR7bWV0YWRhdGEubWF4QXJnc30gJHtwbHVyYWxpemVBcmd1bWVudHMoXG4gICAgICAgICAgICAgICAgbWV0YWRhdGEubWF4QXJncyxcbiAgICAgICAgICAgICAgKX0gZm9yICR7bmFtZX0oKSwgZ290ICR7YXJncy5sZW5ndGh9YCxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHdyYXBwZWRDYiA9IHdyYXBwZWRTZW5kTWVzc2FnZUNhbGxiYWNrLmJpbmQobnVsbCwge1xuICAgICAgICAgICAgICByZXNvbHZlLFxuICAgICAgICAgICAgICByZWplY3QsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGFyZ3MucHVzaCh3cmFwcGVkQ2IpO1xuICAgICAgICAgICAgYXBpTmFtZXNwYWNlT2JqLnNlbmRNZXNzYWdlKC4uLmFyZ3MpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IHN0YXRpY1dyYXBwZXJzID0ge1xuICAgICAgICAgIGRldnRvb2xzOiB7XG4gICAgICAgICAgICBuZXR3b3JrOiB7XG4gICAgICAgICAgICAgIG9uUmVxdWVzdEZpbmlzaGVkOiB3cmFwRXZlbnQob25SZXF1ZXN0RmluaXNoZWRXcmFwcGVycyksXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgICAgcnVudGltZToge1xuICAgICAgICAgICAgb25NZXNzYWdlOiB3cmFwRXZlbnQob25NZXNzYWdlV3JhcHBlcnMpLFxuICAgICAgICAgICAgb25NZXNzYWdlRXh0ZXJuYWw6IHdyYXBFdmVudChvbk1lc3NhZ2VXcmFwcGVycyksXG4gICAgICAgICAgICBzZW5kTWVzc2FnZTogd3JhcHBlZFNlbmRNZXNzYWdlLmJpbmQobnVsbCwgXCJzZW5kTWVzc2FnZVwiLCB7XG4gICAgICAgICAgICAgIG1pbkFyZ3M6IDEsXG4gICAgICAgICAgICAgIG1heEFyZ3M6IDMsXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIHRhYnM6IHtcbiAgICAgICAgICAgIHNlbmRNZXNzYWdlOiB3cmFwcGVkU2VuZE1lc3NhZ2UuYmluZChudWxsLCBcInNlbmRNZXNzYWdlXCIsIHtcbiAgICAgICAgICAgICAgbWluQXJnczogMixcbiAgICAgICAgICAgICAgbWF4QXJnczogMyxcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgIH0sXG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IHNldHRpbmdNZXRhZGF0YSA9IHtcbiAgICAgICAgICBjbGVhcjoge1xuICAgICAgICAgICAgbWluQXJnczogMSxcbiAgICAgICAgICAgIG1heEFyZ3M6IDEsXG4gICAgICAgICAgfSxcbiAgICAgICAgICBnZXQ6IHtcbiAgICAgICAgICAgIG1pbkFyZ3M6IDEsXG4gICAgICAgICAgICBtYXhBcmdzOiAxLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgc2V0OiB7XG4gICAgICAgICAgICBtaW5BcmdzOiAxLFxuICAgICAgICAgICAgbWF4QXJnczogMSxcbiAgICAgICAgICB9LFxuICAgICAgICB9O1xuICAgICAgICBhcGlNZXRhZGF0YS5wcml2YWN5ID0ge1xuICAgICAgICAgIG5ldHdvcms6IHtcbiAgICAgICAgICAgIFwiKlwiOiBzZXR0aW5nTWV0YWRhdGEsXG4gICAgICAgICAgfSxcbiAgICAgICAgICBzZXJ2aWNlczoge1xuICAgICAgICAgICAgXCIqXCI6IHNldHRpbmdNZXRhZGF0YSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIHdlYnNpdGVzOiB7XG4gICAgICAgICAgICBcIipcIjogc2V0dGluZ01ldGFkYXRhLFxuICAgICAgICAgIH0sXG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiB3cmFwT2JqZWN0KGV4dGVuc2lvbkFQSXMsIHN0YXRpY1dyYXBwZXJzLCBhcGlNZXRhZGF0YSk7XG4gICAgICB9OyAvLyBUaGUgYnVpbGQgcHJvY2VzcyBhZGRzIGEgVU1EIHdyYXBwZXIgYXJvdW5kIHRoaXMgZmlsZSwgd2hpY2ggbWFrZXMgdGhlXG4gICAgICAvLyBgbW9kdWxlYCB2YXJpYWJsZSBhdmFpbGFibGUuXG5cbiAgICAgIG1vZHVsZS5leHBvcnRzID0gd3JhcEFQSXMoY2hyb21lKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbW9kdWxlLmV4cG9ydHMgPSBnbG9iYWxUaGlzLmJyb3dzZXI7XG4gICAgfVxuICB9LFxuKTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWJyb3dzZXItcG9seWZpbGwuanMubWFwXG4iXSwibmFtZXMiOlsidGhpcyIsIm1vZHVsZSIsInByb3h5VGFyZ2V0IiwidmFsdWUiLCJtZXNzYWdlIl0sIm1hcHBpbmdzIjoiOzs7O0FBQUE7QUFBQTtBQUFBLEtBQUMsU0FBVSxRQUFRLFNBQVM7QUFDMUIsVUFBSSxPQUFPLFdBQVcsY0FBYyxPQUFPLEtBQUs7QUFDOUMsZUFBTyx5QkFBeUIsQ0FBQyxRQUFRLEdBQUcsT0FBTztBQUFBLE1BQ3ZELFdBQWEsT0FBTyxZQUFZLGFBQWE7QUFDekMsZ0JBQVEsTUFBTTtBQUFBLE1BQ2xCLE9BQVM7QUFDTCxZQUFJLE1BQU07QUFBQSxVQUNSLFNBQVMsQ0FBRTtBQUFBLFFBQ2pCO0FBQ0ksZ0JBQVEsR0FBRztBQUNYLGVBQU8sVUFBVSxJQUFJO0FBQUEsTUFDdEI7QUFBQSxJ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
