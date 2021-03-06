"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const log4js = require("log4js");
const util = require("util");
const stream = require("stream");
const marked = require("marked");
const TerminalRenderer = require("marked-terminal");
const chalk = require("chalk");
class Logger {
    constructor($config, $options) {
        this.$options = $options;
        this.log4jsLogger = null;
        this.encodeRequestPaths = ['/appbuilder/api/itmstransporter/applications?username='];
        this.encodeBody = false;
        this.passwordRegex = /(password=).*?(['&,]|$)|(["']?.*?password["']?\s*:\s*["']).*?(["'])/i;
        this.passwordReplacement = "$1$3*******$2$4";
        this.passwordBodyReplacement = "$1*******$2";
        this.requestBodyRegex = /(^\").*?(\"$)/;
        const appenders = [];
        if (!$config.CI_LOGGER) {
            appenders.push({
                type: "console",
                layout: {
                    type: "messagePassThrough"
                }
            });
        }
        log4js.configure({ appenders: appenders });
        this.log4jsLogger = log4js.getLogger();
        if (this.$options.log) {
            this.log4jsLogger.setLevel(this.$options.log);
        }
        else {
            this.log4jsLogger.setLevel($config.DEBUG ? "TRACE" : "INFO");
        }
    }
    setLevel(level) {
        this.log4jsLogger.setLevel(level);
    }
    getLevel() {
        return this.log4jsLogger.level.toString();
    }
    fatal(...args) {
        this.log4jsLogger.fatal.apply(this.log4jsLogger, args);
    }
    error(...args) {
        const message = util.format.apply(null, args);
        const colorizedMessage = message.red;
        this.log4jsLogger.error.apply(this.log4jsLogger, [colorizedMessage]);
    }
    warn(...args) {
        const message = util.format.apply(null, args);
        const colorizedMessage = message.yellow;
        this.log4jsLogger.warn.apply(this.log4jsLogger, [colorizedMessage]);
    }
    warnWithLabel(...args) {
        const message = util.format.apply(null, args);
        this.warn(`${Logger.LABEL} ${message}`);
    }
    info(...args) {
        this.log4jsLogger.info.apply(this.log4jsLogger, args);
    }
    debug(...args) {
        const encodedArgs = this.getPasswordEncodedArguments(args);
        this.log4jsLogger.debug.apply(this.log4jsLogger, encodedArgs);
    }
    trace(...args) {
        const encodedArgs = this.getPasswordEncodedArguments(args);
        this.log4jsLogger.trace.apply(this.log4jsLogger, encodedArgs);
    }
    out(...args) {
        console.log(util.format.apply(null, args));
    }
    write(...args) {
        process.stdout.write(util.format.apply(null, args));
    }
    prepare(item) {
        if (typeof item === "undefined" || item === null) {
            return "[no content]";
        }
        if (typeof item === "string") {
            return item;
        }
        if (item instanceof stream.Readable) {
            return "[ReadableStream]";
        }
        if (item instanceof Buffer) {
            return "[Buffer]";
        }
        return JSON.stringify(item);
    }
    printInfoMessageOnSameLine(message) {
        if (!this.$options.log || this.$options.log === "info") {
            this.write(message);
        }
    }
    printMsgWithTimeout(message, timeout) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                this.printInfoMessageOnSameLine(message);
                resolve();
            }, timeout);
        });
    }
    printMarkdown(...args) {
        const opts = {
            unescape: true,
            link: chalk.red,
            tableOptions: {
                chars: { 'mid': '', 'left-mid': '', 'mid-mid': '', 'right-mid': '' },
                style: {
                    'padding-left': 1,
                    'padding-right': 1,
                    head: ['green', 'bold'],
                    border: ['grey'],
                    compact: false
                }
            }
        };
        marked.setOptions({ renderer: new TerminalRenderer(opts) });
        const formattedMessage = marked(util.format.apply(null, args));
        this.write(formattedMessage);
    }
    getPasswordEncodedArguments(args) {
        return _.map(args, argument => {
            if (typeof argument !== 'string') {
                return argument;
            }
            argument = argument.replace(this.passwordRegex, this.passwordReplacement);
            if (this.encodeBody) {
                argument = argument.replace(this.requestBodyRegex, this.passwordBodyReplacement);
            }
            _.each(this.encodeRequestPaths, path => {
                if (argument.indexOf('path') > -1) {
                    this.encodeBody = argument.indexOf(path) > -1;
                    return false;
                }
            });
            return argument;
        });
    }
}
Logger.LABEL = "[WARNING]:";
exports.Logger = Logger;
$injector.register("logger", Logger);
