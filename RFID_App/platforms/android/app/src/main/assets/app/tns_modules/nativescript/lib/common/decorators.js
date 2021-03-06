"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
function cache() {
    return (target, propertyKey, descriptor) => {
        let result;
        const propName = descriptor.value ? "value" : "get";
        const originalValue = descriptor[propName];
        descriptor[propName] = function (...args) {
            const propertyName = `__isCalled_${propertyKey}__`;
            if (this && !this[propertyName]) {
                this[propertyName] = true;
                result = originalValue.apply(this, args);
            }
            return result;
        };
        return descriptor;
    };
}
exports.cache = cache;
function invokeBefore(methodName, methodArgs) {
    return (target, propertyKey, descriptor) => {
        const originalValue = descriptor.value;
        descriptor.value = function (...args) {
            return __awaiter(this, void 0, void 0, function* () {
                yield target[methodName].apply(this, methodArgs);
                return originalValue.apply(this, args);
            });
        };
        return descriptor;
    };
}
exports.invokeBefore = invokeBefore;
function invokeInit() {
    return invokeBefore("init");
}
exports.invokeInit = invokeInit;
function exported(moduleName) {
    return (target, propertyKey, descriptor) => {
        $injector.publicApi.__modules__[moduleName] = $injector.publicApi.__modules__[moduleName] || {};
        $injector.publicApi.__modules__[moduleName][propertyKey] = (...args) => {
            const originalModule = $injector.resolve(moduleName), originalMethod = originalModule[propertyKey], result = originalMethod.apply(originalModule, args);
            return result;
        };
        return descriptor;
    };
}
exports.exported = exported;
