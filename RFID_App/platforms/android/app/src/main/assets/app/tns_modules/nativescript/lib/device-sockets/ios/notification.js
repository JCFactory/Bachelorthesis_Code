"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const constants_1 = require("../../common/constants");
class IOSNotification extends events_1.EventEmitter {
    getWaitForDebug(projectId) {
        return this.formatNotification(IOSNotification.WAIT_FOR_DEBUG_NOTIFICATION_NAME, projectId);
    }
    getAttachRequest(appId, deviceId) {
        this.emit(constants_1.ATTACH_REQUEST_EVENT_NAME, { deviceId, appId });
        return this.formatNotification(IOSNotification.ATTACH_REQUEST_NOTIFICATION_NAME, appId);
    }
    getAppLaunching(projectId) {
        return this.formatNotification(IOSNotification.APP_LAUNCHING_NOTIFICATION_NAME, projectId);
    }
    getReadyForAttach(projectId) {
        return this.formatNotification(IOSNotification.READY_FOR_ATTACH_NOTIFICATION_NAME, projectId);
    }
    getAttachAvailabilityQuery(projectId) {
        return this.formatNotification(IOSNotification.ATTACH_AVAILABILITY_QUERY_NOTIFICATION_NAME, projectId);
    }
    getAlreadyConnected(projectId) {
        return this.formatNotification(IOSNotification.ALREADY_CONNECTED_NOTIFICATION_NAME, projectId);
    }
    getAttachAvailable(projectId) {
        return this.formatNotification(IOSNotification.ATTACH_AVAILABLE_NOTIFICATION_NAME, projectId);
    }
    formatNotification(notification, projectId) {
        return `${projectId}:NativeScript.Debug.${notification}`;
    }
}
IOSNotification.WAIT_FOR_DEBUG_NOTIFICATION_NAME = "WaitForDebugger";
IOSNotification.ATTACH_REQUEST_NOTIFICATION_NAME = "AttachRequest";
IOSNotification.APP_LAUNCHING_NOTIFICATION_NAME = "AppLaunching";
IOSNotification.READY_FOR_ATTACH_NOTIFICATION_NAME = "ReadyForAttach";
IOSNotification.ATTACH_AVAILABILITY_QUERY_NOTIFICATION_NAME = "AttachAvailabilityQuery";
IOSNotification.ALREADY_CONNECTED_NOTIFICATION_NAME = "AlreadyConnected";
IOSNotification.ATTACH_AVAILABLE_NOTIFICATION_NAME = "AttachAvailable";
exports.IOSNotification = IOSNotification;
$injector.register("iOSNotification", IOSNotification);
