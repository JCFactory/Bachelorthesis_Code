"use strict";
(function (Log) {
    Log[Log["VERBOSE"] = 0] = "VERBOSE";
    Log[Log["DEBUG"] = 1] = "DEBUG";
    Log[Log["INFO"] = 2] = "INFO";
    Log[Log["WARN"] = 3] = "WARN";
    Log[Log["ERROR"] = 4] = "ERROR";
})(exports.Log || (exports.Log = {}));
var Log = exports.Log;
(function (Storage) {
    Storage[Storage["SQLLite"] = 0] = "SQLLite";
    Storage[Storage["ForestDB"] = 1] = "ForestDB";
})(exports.Storage || (exports.Storage = {}));
var Storage = exports.Storage;
(function (AttachmentImage) {
    AttachmentImage[AttachmentImage["PNG"] = 0] = "PNG";
    AttachmentImage[AttachmentImage["JPG"] = 1] = "JPG";
})(exports.AttachmentImage || (exports.AttachmentImage = {}));
var AttachmentImage = exports.AttachmentImage;
(function (IndexUpdateMode) {
    IndexUpdateMode[IndexUpdateMode["BEFORE"] = 0] = "BEFORE";
    IndexUpdateMode[IndexUpdateMode["AFTER"] = 1] = "AFTER";
    IndexUpdateMode[IndexUpdateMode["NEVER"] = 2] = "NEVER";
})(exports.IndexUpdateMode || (exports.IndexUpdateMode = {}));
var IndexUpdateMode = exports.IndexUpdateMode;
(function (ReplicationError) {
    ReplicationError[ReplicationError["Authentication"] = 401] = "Authentication";
})(exports.ReplicationError || (exports.ReplicationError = {}));
var ReplicationError = exports.ReplicationError;
(function (ReplicationStatus) {
    ReplicationStatus[ReplicationStatus["Stopped"] = 0] = "Stopped";
    ReplicationStatus[ReplicationStatus["Offline"] = 1] = "Offline";
    ReplicationStatus[ReplicationStatus["Idle"] = 2] = "Idle";
    ReplicationStatus[ReplicationStatus["Active"] = 3] = "Active";
})(exports.ReplicationStatus || (exports.ReplicationStatus = {}));
var ReplicationStatus = exports.ReplicationStatus;
var JSTypeChecker = (function () {
    function JSTypeChecker() {
    }
    JSTypeChecker.isUndefined = function (jsO) {
        return typeof jsO === "undefined" || jsO == null || (JSTypeChecker.isNumber(jsO) && isNaN(jsO));
    };
    JSTypeChecker.isDate = function (jsO) {
        return jsO instanceof Date;
    };
    JSTypeChecker.isString = function (jsO) {
        return typeof jsO == "string" || jsO instanceof String;
    };
    JSTypeChecker.isBoolean = function (jsO) {
        return typeof jsO == "boolean" || jsO instanceof Boolean;
    };
    JSTypeChecker.isNumber = function (jsO) {
        return typeof jsO == "number" || jsO instanceof Number;
    };
    JSTypeChecker.isInt = function (jsO) {
        return JSTypeChecker.isNumber(jsO) && jsO % 1 === 0;
    };
    JSTypeChecker.isFloat = function (jsO) {
        return JSTypeChecker.isNumber(jsO) && !JSTypeChecker.isInt(jsO);
    };
    JSTypeChecker.isMap = function (jsO) {
        return jsO instanceof Map;
    };
    JSTypeChecker.isArray = function (jsO) {
        return jsO instanceof Array;
    };
    return JSTypeChecker;
}());
exports.JSTypeChecker = JSTypeChecker;
