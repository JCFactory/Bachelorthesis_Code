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
class AnalyticsCommandParameter {
    constructor($errors) {
        this.$errors = $errors;
        this.mandatory = false;
    }
    validate(validationValue) {
        return __awaiter(this, void 0, void 0, function* () {
            const val = validationValue || "";
            switch (val.toLowerCase()) {
                case "enable":
                case "disable":
                case "status":
                case "":
                    return true;
                default:
                    this.$errors.fail(`The value '${validationValue}' is not valid. Valid values are 'enable', 'disable' and 'status'.`);
            }
        });
    }
}
exports.AnalyticsCommandParameter = AnalyticsCommandParameter;
class AnalyticsCommand {
    constructor($analyticsService, $logger, $errors, $options, settingName, humanReadableSettingName) {
        this.$analyticsService = $analyticsService;
        this.$logger = $logger;
        this.$errors = $errors;
        this.$options = $options;
        this.settingName = settingName;
        this.humanReadableSettingName = humanReadableSettingName;
        this.allowedParameters = [new AnalyticsCommandParameter(this.$errors)];
        this.disableAnalytics = true;
    }
    execute(args) {
        return __awaiter(this, void 0, void 0, function* () {
            const arg = args[0] || "";
            switch (arg.toLowerCase()) {
                case "enable":
                    yield this.$analyticsService.setStatus(this.settingName, true);
                    yield this.$analyticsService.track(this.settingName, "enabled");
                    this.$logger.info(`${this.humanReadableSettingName} is now enabled.`);
                    break;
                case "disable":
                    yield this.$analyticsService.track(this.settingName, "disabled");
                    yield this.$analyticsService.setStatus(this.settingName, false);
                    this.$logger.info(`${this.humanReadableSettingName} is now disabled.`);
                    break;
                case "status":
                case "":
                    this.$logger.out(yield this.$analyticsService.getStatusMessage(this.settingName, this.$options.json, this.humanReadableSettingName));
                    break;
            }
        });
    }
}
class UsageReportingCommand extends AnalyticsCommand {
    constructor($analyticsService, $logger, $errors, $options, $staticConfig) {
        super($analyticsService, $logger, $errors, $options, $staticConfig.TRACK_FEATURE_USAGE_SETTING_NAME, "Usage reporting");
        this.$analyticsService = $analyticsService;
    }
}
exports.UsageReportingCommand = UsageReportingCommand;
$injector.registerCommand("usage-reporting", UsageReportingCommand);
class ErrorReportingCommand extends AnalyticsCommand {
    constructor($analyticsService, $logger, $errors, $options, $staticConfig) {
        super($analyticsService, $logger, $errors, $options, $staticConfig.ERROR_REPORT_SETTING_NAME, "Error reporting");
        this.$analyticsService = $analyticsService;
    }
}
exports.ErrorReportingCommand = ErrorReportingCommand;
$injector.registerCommand("error-reporting", ErrorReportingCommand);
