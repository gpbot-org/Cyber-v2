"use strict";

var utils = require("./utils");
var cheerio = require("cheerio");
var log = require("npmlog");

var defaultLogRecordSize = 100;
log.maxRecordSize = defaultLogRecordSize;

function setOptions(globalOptions, options) {
    Object.keys(options).map(function(key) {
        switch (key) {
            case 'pauseLog':
                if (options.pauseLog) log.pause();
                break;
            case 'logLevel':
                log.level = options.logLevel;
                globalOptions.logLevel = options.logLevel;
                break;
            case 'logRecordSize':
                log.maxRecordSize = options.logRecordSize;
                globalOptions.logRecordSize = options.logRecordSize;
                break;
            case 'selfListen':
                globalOptions.selfListen = Boolean(options.selfListen);
                break;
            case 'listenEvents':
                globalOptions.listenEvents = Boolean(options.listenEvents);
                break;
            case 'pageID':
                globalOptions.pageID = options.pageID.toString();
                break;
            case 'updatePresence':
                globalOptions.updatePresence = Boolean(options.updatePresence);
                break;
            case 'forceLogin':
                globalOptions.forceLogin = Boolean(options.forceLogin);
                break;
            case 'userAgent':
                globalOptions.userAgent = options.userAgent;
                break;
            case 'autoMarkDelivery':
                globalOptions.autoMarkDelivery = Boolean(options.autoMarkDelivery);
                break;
            case 'autoMarkRead':
                globalOptions.autoMarkRead = Boolean(options.autoMarkRead);
                break;
            case 'listenTyping':
                globalOptions.listenTyping = Boolean(options.listenTyping);
                break;
            case 'proxy':
                if (typeof options.proxy != "string") {
                    delete globalOptions.proxy;
                    utils.setProxy();
                } else {
                    globalOptions.proxy = options.proxy;
                    utils.setProxy(globalOptions.proxy);
                }
                break;
            case 'autoReconnect':
                globalOptions.autoReconnect = Boolean(options.autoReconnect);
                break;
            case 'emitReady':
                globalOptions.emitReady = Boolean(options.emitReady);
                break;
            default:
                log.warn("setOptions", "Unrecognized option given to setOptions: " + key);
                break;
        }
    });
}

function buildAPI(globalOptions, html, jar) {
    var maybeCookie = jar.getCookies("https://www.facebook.com").filter(function(val) {
        return val.cookieString().split("=")[0] === "c_user";
    });

    if (maybeCookie.length === 0) {
        throw { error: "Error retrieving userID. This can be caused by a lot of things, including getting blocked by Facebook for logging in from an unknown location. Try logging in with a browser first and then trying again." };
    }

    if (html.indexOf("/checkpoint/block/?next") > -1) {
        log.warn("login", "Checkpoint detected. Please log in with a browser to verify.");
    }

    var userID = maybeCookie[0].cookieString().split("=")[1].toString();
    log.info("login", "Logged in");

    try {
        clearInterval(checkVerified);
    } catch (ex) {
        // Ignore
    }

    var clientID = (Math.random() * 2147483648 | 0).toString(16);

    var CHECK_MQTT = {
        oldFBMQTTMatch: html.match(/irisSeqID:"(.+?)",appID:219994525426954,initialChatFriendsList:/),
        newFBMQTTMatch: html.match(/{"app_id":"219994525426954","endpoint":"(.+?)","pollingEndpoint":"(.+?)","subscriber_id":"(.+?)","subscription_id":"(.+?)","request_id":"(.+?)","session_id":"(.+?)"}/)
    };

    var api = {
        setOptions: setOptions.bind(null, globalOptions),
        getAppState: function getAppState() {
            return utils.getAppState(jar);
        }
    };

    if (CHECK_MQTT.oldFBMQTTMatch) {
        api["listenMqtt"] = require("./src/listenMqtt")(globalOptions, ctx);
        api["sendMessage"] = require("./src/sendMessage")(globalOptions, ctx);
    }

    var ctx = {
        userID: userID,
        jar: jar,
        clientID: clientID,
        globalOptions: globalOptions,
        loggedIn: true,
        access_token: (html.match(/"accessToken":"(.*?)"/) || ["", ""])[1],
        clientMutationId: 0,
        mqttClient: undefined,
        lastSeqId: undefined,
        syncToken: undefined,
        mqttEndpoint: "",
        region: (html.match(/"region":"(\w+\w+)"/) || ["", ""])[1],
        firstListen: true
    };

    var api = {
        setOptions: setOptions.bind(null, globalOptions),
        getAppState: function getAppState() {
            return utils.getAppState(jar);
        }
    };

    // Load all API functions
    var apiPath = __dirname + "/src/";
    var apiFiles = require("fs").readdirSync(apiPath).filter(function(v) {
        return v.endsWith(".js");
    });

    for (var i = 0; i < apiFiles.length; i++) {
        var fileName = apiFiles[i];
        var funcName = fileName.split(".")[0];
        try {
            api[funcName] = require(apiPath + fileName)(globalOptions, ctx);
        } catch (ex) {
            log.warn("buildAPI", "Failed to load function " + funcName + ": " + ex);
        }
    }

    return api;
}

function makeLogin(jar, email, password, loginOptions, callback, prCallback) {
    return utils.get('https://www.facebook.com/', jar, null, loginOptions, prCallback)
        .then(utils.saveCookies(jar))
        .then(function(res) {
            var html = res.body;
            var $ = cheerio.load(html);
            var arr = [];

            $("#login_form input").map(function(i, v) {
                arr.push({ val: $(v).val(), name: $(v).attr("name") });
            });

            arr = arr.filter(function(v) {
                return v.val && v.val.length;
            });

            var form = utils.arrToForm(arr);
            form.lsd = utils.getFrom(html, "[\"LSD\",[],{\"token\":\"", "\"}");
            form.lgndim = Buffer.from("{\"w\":1440,\"h\":900,\"aw\":1440,\"ah\":834,\"c\":24}").toString('base64');
            form.email = email;
            form.pass = password;
            form.default_persistent = '0';
            form.lgnrnd = utils.getFrom(html, "name=\"lgnrnd\" value=\"", "\"");
            form.locale = 'en_US';
            form.timezone = '240';
            form.lgnjs = ~~(Date.now() / 1000);

            return utils.post("https://www.facebook.com/login.php?login_attempt=1&lwv=110", jar, form, loginOptions, prCallback);
        })
        .then(utils.saveCookies(jar))
        .then(function(res) {
            var headers = res.headers;
            if (!headers.location) throw { error: "Wrong username/password." };

            if (headers.location.indexOf('https://www.facebook.com/checkpoint/') > -1) {
                log.info("login", "Checkpoint detected. Please log in with a browser to verify.");
                var nextURL = 'https://www.facebook.com/checkpoint/?next=https%3A%2F%2Fwww.facebook.com%2Fhome.php';
                return utils.get(nextURL, jar, null, loginOptions, prCallback).then(utils.saveCookies(jar));
            }

            if (headers.location.indexOf('https://www.facebook.com/login/device-based/regular/login/?login_attempt=1&lwv=110') > -1) {
                throw {
                    error: 'The email or phone number you entered doesn\'t match any account. Sign up for an account.'
                };
            }

            var appstate = utils.getAppState(jar);

            if (callback === prCallback) {
                callback = function(err, api) {
                    if (err) return prCallback(err);
                    return prCallback(null, api);
                };
            }

            return utils.get('https://www.facebook.com/', jar, null, loginOptions, prCallback).then(utils.saveCookies(jar));
        })
        .then(function(res) {
            var html = res.body;
            return buildAPI(globalOptions, html, jar);
        })
        .catch(function(e) {
            log.error("login", e.error || e);
            callback(e);
        });
}

// Exported login function
function login(loginData, options, callback) {
    var globalOptions = {
        selfListen: false,
        listenEvents: false,
        listenTyping: false,
        updatePresence: false,
        forceLogin: false,
        autoMarkDelivery: true,
        autoMarkRead: false,
        autoReconnect: true,
        logRecordSize: defaultLogRecordSize,
        online: true,
        emitReady: false,
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_2) AppleWebKit/600.3.18 (KHTML, like Gecko) Version/8.0.3 Safari/600.3.18"
    };

    setOptions(globalOptions, options);

    var prCallback = null;
    if (utils.getType(callback) !== "Function" && utils.getType(callback) !== "AsyncFunction") {
        var rejectFunc = null;
        var resolveFunc = null;
        var returnPromise = new Promise(function(resolve, reject) {
            resolveFunc = resolve;
            rejectFunc = reject;
        });
        prCallback = function(error, api) {
            if (error) return rejectFunc(error);
            return resolveFunc(api);
        };
        callback = prCallback;
    }

    loginData = loginData || {};

    var jar = utils.getJar();

    if (loginData.appState) {
        try {
            jar.setCookies(loginData.appState.map(function(c) {
                return c.key + "=" + c.value + "; expires=" + c.expires + "; domain=" + c.domain + "; path=" + c.path + ";";
            }), "https://www.facebook.com");

            loginData.appState.map(function(c) {
                jar.setCookie(c.key + "=" + c.value + "; expires=" + c.expires + "; domain=" + c.domain + "; path=" + c.path + ";", "https://www.facebook.com");
            });
        } catch (e) {
            return callback({ error: "Invalid appState format." });
        }

        return utils.get('https://www.facebook.com/', jar, null, globalOptions, prCallback)
            .then(utils.saveCookies(jar))
            .then(function(res) {
                var html = res.body;
                if (html.indexOf("/login") > -1) throw { error: "Invalid appState: " + res.statusCode };
                return buildAPI(globalOptions, html, jar);
            })
            .then(function(api) {
                callback(null, api);
            })
            .catch(function(e) {
                callback(e);
            });
    } else {
        if (!loginData.email || !loginData.password) {
            return callback({ error: "Email and password are required." });
        }
        return makeLogin(jar, loginData.email, loginData.password, globalOptions, callback, prCallback);
    }

    return returnPromise;
}

module.exports = login;
