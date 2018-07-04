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
const uuid = require("uuid");
const ua = require("universal-analytics");
class GoogleAnalyticsProvider {
    constructor(clientId, $staticConfig, $analyticsSettingsService, $logger, $proxyService) {
        this.clientId = clientId;
        this.$staticConfig = $staticConfig;
        this.$analyticsSettingsService = $analyticsSettingsService;
        this.$logger = $logger;
        this.$proxyService = $proxyService;
    }
    trackHit(trackInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            const sessionId = uuid.v4();
            try {
                yield this.track(GoogleAnalyticsProvider.GA_TRACKING_ID, trackInfo, sessionId);
            }
            catch (e) {
                this.$logger.trace("Analytics exception: ", e);
            }
        });
    }
    track(gaTrackingId, trackInfo, sessionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const proxySettings = yield this.$proxyService.getCache();
            const proxy = proxySettings && proxySettings.proxy;
            const visitor = ua({
                tid: gaTrackingId,
                cid: this.clientId,
                headers: {
                    ["User-Agent"]: this.$analyticsSettingsService.getUserAgentString(`tnsCli/${this.$staticConfig.version}`)
                },
                requestOptions: {
                    proxy
                }
            });
            yield this.setCustomDimensions(visitor, trackInfo.customDimensions, sessionId);
            switch (trackInfo.googleAnalyticsDataType) {
                case "pageview":
                    yield this.trackPageView(visitor, trackInfo);
                    break;
                case "event":
                    yield this.trackEvent(visitor, trackInfo);
                    break;
            }
        });
    }
    setCustomDimensions(visitor, customDimensions, sessionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const defaultValues = {
                ["cd1"]: this.$staticConfig.version,
                ["cd6"]: process.version,
                ["cd3"]: this.clientId,
                ["cd2"]: null,
                ["cd4"]: sessionId,
                ["cd5"]: "Unknown"
            };
            const playgrounInfo = yield this.$analyticsSettingsService.getPlaygroundInfo();
            if (playgrounInfo && playgrounInfo.id) {
                defaultValues["cd7"] = playgrounInfo.id;
                defaultValues["cd8"] = playgrounInfo.usedTutorial.toString();
            }
            customDimensions = _.merge(defaultValues, customDimensions);
            _.each(customDimensions, (value, key) => {
                visitor.set(key, value);
            });
        });
    }
    trackEvent(visitor, trackInfo) {
        return new Promise((resolve, reject) => {
            visitor.event(trackInfo.category, trackInfo.action, trackInfo.label, trackInfo.value, { p: this.currentPage }, (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    }
    trackPageView(visitor, trackInfo) {
        return new Promise((resolve, reject) => {
            this.currentPage = trackInfo.path;
            const pageViewData = {
                dp: trackInfo.path,
                dt: trackInfo.title
            };
            visitor.pageview(pageViewData, (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    }
}
GoogleAnalyticsProvider.GA_TRACKING_ID = "UA-111455-44";
exports.GoogleAnalyticsProvider = GoogleAnalyticsProvider;
$injector.register("googleAnalyticsProvider", GoogleAnalyticsProvider);
