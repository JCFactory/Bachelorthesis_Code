"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ProcessService {
    constructor() {
        this._listeners = [];
    }
    get listenersCount() {
        return this._listeners.length;
    }
    attachToProcessExitSignals(context, callback) {
        const callbackToString = callback.toString();
        if (this._listeners.length === 0) {
            _.each(ProcessService.PROCESS_EXIT_SIGNALS, (signal) => {
                process.on(signal, () => this.executeAllCallbacks.apply(this));
            });
        }
        if (!_.some(this._listeners, (listener) => context === listener.context && callbackToString === listener.callback.toString())) {
            this._listeners.push({ context, callback });
        }
    }
    executeAllCallbacks() {
        _.each(this._listeners, (listener) => {
            try {
                listener.callback.apply(listener.context);
            }
            catch (err) {
            }
        });
    }
}
ProcessService.PROCESS_EXIT_SIGNALS = ["exit", "SIGINT", "SIGTERM"];
exports.ProcessService = ProcessService;
$injector.register("processService", ProcessService);
