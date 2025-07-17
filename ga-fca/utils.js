"use strict";

var request = require("request");
var stream = require("stream");
var log = require("npmlog");
var fs = require("fs");
var path = require("path");
var bluebird = require("bluebird");

var utils = module.exports = {
    defaultLogRecordSize: 100,
    
    getType: function(obj) {
        return Object.prototype.toString.call(obj).slice(8, -1);
    },

    getJar: function() {
        return request.jar();
    },

    getAppState: function(jar) {
        return jar.getCookies("https://www.facebook.com").map(function(c) {
            return {
                key: c.key,
                value: c.value,
                expires: c.expires,
                domain: c.domain,
                path: c.path
            };
        });
    },

    saveCookies: function(jar) {
        return function(res) {
            var cookies = res.headers['set-cookie'];
            if (cookies) {
                cookies.forEach(function(cookie) {
                    jar.setCookie(cookie, "https://www.facebook.com");
                });
            }
            return res;
        };
    },

    get: function(url, jar, qs, globalOptions, callback) {
        if (utils.getType(qs) === "Function") {
            callback = qs;
            qs = {};
        }

        var options = {
            url: url,
            jar: jar,
            headers: {
                'User-Agent': globalOptions.userAgent
            },
            qs: qs,
            gzip: true
        };

        if (globalOptions.proxy) {
            options.proxy = globalOptions.proxy;
        }

        return new Promise(function(resolve, reject) {
            request(options, function(err, res, body) {
                if (err) return reject(err);
                resolve({
                    body: body,
                    headers: res.headers,
                    statusCode: res.statusCode
                });
            });
        });
    },

    post: function(url, jar, form, globalOptions, callback) {
        var options = {
            url: url,
            jar: jar,
            headers: {
                'User-Agent': globalOptions.userAgent
            },
            form: form,
            gzip: true
        };

        if (globalOptions.proxy) {
            options.proxy = globalOptions.proxy;
        }

        return new Promise(function(resolve, reject) {
            request.post(options, function(err, res, body) {
                if (err) return reject(err);
                resolve({
                    body: body,
                    headers: res.headers,
                    statusCode: res.statusCode
                });
            });
        });
    },

    setProxy: function(proxy) {
        if (proxy) {
            request = request.defaults({'proxy': proxy});
        }
    },

    getFrom: function(str, startToken, endToken) {
        var start = str.indexOf(startToken) + startToken.length;
        if (start < startToken.length) return "";
        
        var end = str.indexOf(endToken, start);
        if (end === -1) return "";
        
        return str.substring(start, end);
    },

    arrToForm: function(arr) {
        var form = {};
        for (var i = 0; i < arr.length; i++) {
            form[arr[i].name] = arr[i].val;
        }
        return form;
    },

    generateThreadingID: function(clientID) {
        var k = Date.now();
        var l = Math.floor(Math.random() * 4294967295);
        var m = clientID;
        return "<" + k + ":" + l + "-" + m + "@mail.projektitan.com>";
    },

    generateOfflineThreadingID: function() {
        var ret = Date.now();
        var value = Math.floor(Math.random() * 4294967295);
        var str = ("0000000000000000000000" + value.toString(16)).substring(0, 8);
        ret = ret + ":" + str;
        return ret;
    },

    getGUID: function() {
        var sectionLength = Date.now();
        var id = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
            var r = Math.floor((sectionLength + Math.random() * 16) % 16);
            sectionLength = Math.floor(sectionLength / 16);
            var _guid = (c == "x" ? r : (r & 7 | 8)).toString(16);
            return _guid;
        });
        return id;
    },

    getClientID: function() {
        return Math.random() * 2147483648 | 0;
    },

    formatMessage: function(msg) {
        if (typeof msg === "string") {
            return {
                body: msg,
                mentions: {},
                attachment: []
            };
        }
        return msg;
    },

    log: log
};
