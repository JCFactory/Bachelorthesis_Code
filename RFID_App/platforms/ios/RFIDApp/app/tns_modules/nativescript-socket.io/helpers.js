'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
function serialize(data) {
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
                return NSNull.new();
            }
            if (Array.isArray(data)) {
                return NSArray.arrayWithArray(data.map(serialize));
            }
            var node_1 = {};
            Object.keys(data).forEach(function (key) {
                var value = data[key];
                node_1[key] = serialize(value);
            });
            return NSDictionary.dictionaryWithDictionary(node_1);
        default:
            return NSNull.new();
    }
}
exports.serialize = serialize;
function deserialize(nativeData) {
    if (nativeData instanceof NSNull) {
        return null;
    }
    if (nativeData instanceof NSArray) {
        var array = [];
        for (var i = 0, n = nativeData.count; i < n; i++) {
            array[i] = deserialize(nativeData.objectAtIndex(i));
        }
        ;
        return array;
    }
    if (nativeData instanceof NSDictionary) {
        var dict = {};
        for (var i = 0, n = nativeData.allKeys.count; i < n; i++) {
            var key = nativeData.allKeys.objectAtIndex(i);
            dict[key] = deserialize(nativeData.objectForKey(key));
        }
        ;
        return dict;
    }
    return nativeData;
}
exports.deserialize = deserialize;
//# sourceMappingURL=helpers.js.map