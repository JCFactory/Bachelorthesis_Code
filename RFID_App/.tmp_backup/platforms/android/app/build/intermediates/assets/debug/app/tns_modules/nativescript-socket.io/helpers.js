'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var JSONObject = org.json.JSONObject;
var JSONArray = org.json.JSONArray;
var JSONException = org.json.JSONException;
function serialize(data) {
    var node;
    switch (typeof data) {
        case 'string':
        case 'boolean':
        case 'number':
            return data;
        case 'object':
            if (data instanceof Date) {
                return data.toJSON();
            }
            if (!data) {
                return null;
            }
            if (Array.isArray(data)) {
                node = new JSONArray();
                data.forEach(function (v) {
                    node.put(serialize(v));
                });
                return node;
            }
            node = new JSONObject();
            Object.keys(data).forEach(function (key) {
                var v = data[key];
                node.put(key, serialize(v));
            });
            return node;
        default:
            return null;
    }
}
exports.serialize = serialize;
function deserialize(nativeData) {
    if (nativeData === null || typeof nativeData !== 'object') {
        return nativeData;
    }
    switch (nativeData.getClass().getName()) {
        case 'java.lang.String':
            return String(nativeData);
        case 'java.lang.Boolean':
            return String(nativeData) === 'true';
        case 'java.lang.Integer':
        case 'java.lang.Long':
        case 'java.lang.Double':
            return Number(String(nativeData));
        case 'org.json.JSONArray':
            var array = [];
            for (var i = 0, l = nativeData.length(); i < l; i++) {
                array[i] = deserialize(nativeData.get(i));
            }
            return array;
        case 'org.json.JSONObject':
            var dict = {};
            var iterator = nativeData.keys();
            while (iterator.hasNext()) {
                var key = iterator.next();
                dict[key] = deserialize(nativeData.get(key));
            }
            return dict;
        default:
            return null;
    }
}
exports.deserialize = deserialize;
//# sourceMappingURL=helpers.js.map