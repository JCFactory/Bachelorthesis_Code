"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DoctorCommand {
    constructor($doctorService, $projectHelper) {
        this.$doctorService = $doctorService;
        this.$projectHelper = $projectHelper;
        this.allowedParameters = [];
    }
    execute(args) {
        return this.$doctorService.printWarnings({ trackResult: false, projectDir: this.$projectHelper.projectDir });
    }
}
exports.DoctorCommand = DoctorCommand;
$injector.registerCommand("doctor", DoctorCommand);
