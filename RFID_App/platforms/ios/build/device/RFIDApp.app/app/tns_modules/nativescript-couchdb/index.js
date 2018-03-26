"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var http = require("http");
var CouchDB = (function () {
    function CouchDB(databaseHost, extraHeaders) {
        this.host = databaseHost;
        this.headers = Object.assign({
            "Content-Type": "application/json"
        }, extraHeaders || {});
    }
    CouchDB.prototype.get = function (id) {
        var params = {
            url: [this.host, id].join("/"),
            method: "GET",
            headers: this.headers
        };
        return new Promise(function (resolve, reject) {
            http.request(params).then(function (response) {
                if (response.statusCode === 200) {
                    resolve(response.content.toJSON());
                }
                else {
                    reject(new Error(response.content));
                }
            }, function (err) { return reject(new Error(err)); });
        });
    };
    CouchDB.prototype.put = function (data) {
        var params = {
            url: [this.host, data._id].join("/"),
            method: "PUT",
            headers: this.headers,
            content: JSON.stringify(data)
        };
        return new Promise(function (resolve, reject) {
            http.request(params).then(function (response) {
                if (response.statusCode === 201) {
                    resolve(response.content.toJSON());
                }
                else {
                    reject(new Error(response.content));
                }
            }, function (err) { return reject(new Error(err)); });
        });
    };
    CouchDB.prototype.remove = function (data) {
        var params = {
            url: [this.host, data._id].join("/"),
            method: "DELETE",
            headers: this.headers,
            content: JSON.stringify(data)
        };
        return new Promise(function (resolve, reject) {
            http.request(params).then(function (response) {
                if (response.statusCode === 200) {
                    resolve(response.content.toJSON());
                }
                else {
                    reject(new Error(response.content));
                }
            }, function (err) { return reject(new Error(err)); });
        });
    };
    CouchDB.prototype.buildRequestParams = function (data) {
        var keys = Object.keys(data);
        var hasQuote = ["startkey", "start_key", "endkey", "end_key"];
        var args = [];
        keys.forEach(function (key) {
            if (key === "keys") {
                var rows = data["keys"] || [];
                var keysValue = '[' + rows.map(function (x) { return '"' + x + '"'; }) + ']';
                args.push("keys=" + encodeURI(keysValue));
            }
            else {
                var value = (hasQuote.indexOf(key) != -1) ? '"' + data[key] + '"' : data[key];
                var item = [key, encodeURI(value)].join("=");
                args.push(item);
            }
        });
        return "?" + args.join("&");
    };
    CouchDB.prototype.allDocs = function (data) {
        var params = {
            url: [this.host, "_all_docs", this.buildRequestParams(data)].join("/"),
            method: "GET",
            headers: this.headers
        };
        return new Promise(function (resolve, reject) {
            http.request(params).then(function (response) {
                if (response.statusCode === 200) {
                    resolve(response.content.toJSON());
                }
                else {
                    reject(new Error(response.content));
                }
            }, function (err) { return reject(new Error(err)); });
        });
    };
    CouchDB.prototype.query = function (designView, options) {
        var _a = designView.split("/"), design = _a[0], view = _a[1];
        var params = {
            url: [this.host, "_design", design, "_view", view].join("/") + this.buildRequestParams(options),
            method: "GET",
            headers: this.headers
        };
        return new Promise(function (resolve, reject) {
            http.request(params).then(function (response) {
                if (response.statusCode === 200) {
                    resolve(response.content.toJSON());
                }
                else {
                    reject(new Error(response.content));
                }
            }, function (err) { return reject(new Error(err)); });
        });
    };
    return CouchDB;
}());
exports.CouchDB = CouchDB;
//# sourceMappingURL=index.js.map