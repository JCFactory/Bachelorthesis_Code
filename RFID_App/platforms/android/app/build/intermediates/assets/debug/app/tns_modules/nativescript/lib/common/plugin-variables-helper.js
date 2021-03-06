"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class PluginVariablesHelper {
    constructor($options) {
        this.$options = $options;
    }
    getPluginVariableFromVarOption(variableName, configuration) {
        let varOption = this.$options.var;
        configuration = configuration ? configuration.toLowerCase() : undefined;
        const lowerCasedVariableName = variableName.toLowerCase();
        if (varOption) {
            let configVariableValue;
            let generalVariableValue;
            if (variableName.indexOf(".") !== -1) {
                varOption = this.simplifyYargsObject(varOption, configuration);
            }
            _.each(varOption, (propValue, propKey) => {
                if (propKey.toLowerCase() === configuration) {
                    _.each(propValue, (configPropValue, configPropKey) => {
                        if (configPropKey.toLowerCase() === lowerCasedVariableName) {
                            configVariableValue = configPropValue;
                            return false;
                        }
                    });
                }
                else if (propKey.toLowerCase() === lowerCasedVariableName) {
                    generalVariableValue = propValue;
                }
            });
            const value = configVariableValue || generalVariableValue;
            if (value) {
                const obj = Object.create(null);
                obj[variableName] = value.toString();
                return obj;
            }
        }
        return undefined;
    }
    simplifyYargsObject(obj, configuration) {
        if (obj && typeof (obj) === "object") {
            const convertedObject = Object.create({});
            _.each(obj, (propValue, propKey) => {
                if (typeof (propValue) !== "object") {
                    convertedObject[propKey] = propValue;
                    return false;
                }
                configuration = configuration ? configuration.toLowerCase() : undefined;
                const innerObj = this.simplifyYargsObject(propValue, configuration);
                if (propKey.toLowerCase() === configuration) {
                    convertedObject[propKey] = innerObj;
                }
                else {
                    _.each(innerObj, (innerPropValue, innerPropKey) => {
                        convertedObject[`${propKey}.${innerPropKey}`] = innerPropValue;
                    });
                }
            });
            return convertedObject;
        }
        return obj;
    }
}
exports.PluginVariablesHelper = PluginVariablesHelper;
$injector.register("pluginVariablesHelper", PluginVariablesHelper);
