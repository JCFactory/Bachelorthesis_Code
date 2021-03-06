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
const mobileprovision = require("ios-mobileprovision-finder");
const helpers_1 = require("../common/helpers");
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function formatDate(date) {
    return `${date.getDay()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}
class IOSProvisionService {
    constructor($logger, $options, $devicesService, $mobileHelper) {
        this.$logger = $logger;
        this.$options = $options;
        this.$devicesService = $devicesService;
        this.$mobileHelper = $mobileHelper;
    }
    pick(uuidOrName, projectId) {
        return __awaiter(this, void 0, void 0, function* () {
            const match = (yield this.queryProvisioningProfilesAndDevices(projectId)).match;
            return match.eligable.find(prov => prov.UUID === uuidOrName)
                || match.eligable.find(prov => prov.Name === uuidOrName)
                || match.nonEligable.find(prov => prov.UUID === uuidOrName)
                || match.nonEligable.find(prov => prov.Name === uuidOrName);
        });
    }
    listProvisions(projectId) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.queryProvisioningProfilesAndDevices(projectId);
            const devices = data.devices;
            const match = data.match;
            function formatSupportedDeviceCount(prov) {
                if (devices.length > 0 && prov.Type === "Development") {
                    return prov.ProvisionedDevices.filter(device => devices.indexOf(device) >= 0).length + "/" + devices.length + " targets";
                }
                else {
                    return "";
                }
            }
            function formatTotalDeviceCount(prov) {
                if (prov.Type === "Development" && prov.ProvisionedDevices) {
                    return prov.ProvisionedDevices.length + " total";
                }
                else if (prov.Type === "AdHoc") {
                    return "all";
                }
                else {
                    return "";
                }
            }
            const table = helpers_1.createTable(["Provision Name / Provision UUID / App Id", "Team", "Type / Due", "Devices"], []);
            function pushProvision(prov) {
                table.push(["", "", "", ""]);
                table.push([helpers_1.quoteString(prov.Name), prov.TeamName, prov.Type, formatTotalDeviceCount(prov)]);
                table.push([prov.UUID, prov.TeamIdentifier && prov.TeamIdentifier.length > 0 ? "(" + prov.TeamIdentifier[0] + ")" : "", formatDate(prov.ExpirationDate), formatSupportedDeviceCount(prov)]);
                table.push([prov.Entitlements["application-identifier"], "", "", ""]);
            }
            match.eligable.forEach(prov => pushProvision(prov));
            this.$logger.out(table.toString());
            this.$logger.out();
            this.$logger.out("There are also " + match.nonEligable.length + " non-eligable provisioning profiles.");
            this.$logger.out();
        });
    }
    listTeams() {
        return __awaiter(this, void 0, void 0, function* () {
            const teams = yield this.getDevelopmentTeams();
            const table = helpers_1.createTable(["Team Name", "Team ID"], teams.map(team => [helpers_1.quoteString(team.name), team.id]));
            this.$logger.out(table.toString());
        });
    }
    queryProvisioningProfilesAndDevices(projectId) {
        return __awaiter(this, void 0, void 0, function* () {
            const certificates = mobileprovision.cert.read();
            const provisions = mobileprovision.provision.read();
            const query = {
                Certificates: certificates.valid,
                Unique: true,
                AppId: projectId
            };
            let devices = [];
            if (this.$options.device) {
                devices = [this.$options.device];
            }
            else {
                yield this.$devicesService.initialize({
                    platform: "ios",
                    skipEmulatorStart: true
                });
                devices = _(this.$devicesService.getDeviceInstances())
                    .filter(d => this.$mobileHelper.isiOSPlatform(d.deviceInfo.platform))
                    .map(d => d.deviceInfo.identifier)
                    .toJSON();
            }
            const match = mobileprovision.provision.select(provisions, query);
            return { devices, match };
        });
    }
    getDevelopmentTeams() {
        return __awaiter(this, void 0, void 0, function* () {
            const teams = {};
            mobileprovision.provision.read().forEach(provision => provision.TeamIdentifier && provision.TeamIdentifier.forEach(id => {
                if (!teams[provision.TeamName]) {
                    teams[provision.TeamName] = new Set();
                }
                teams[provision.TeamName].add(id);
            }));
            const teamsArray = Object.keys(teams).reduce((arr, name) => {
                teams[name].forEach(id => arr.push({ id, name }));
                return arr;
            }, []);
            return teamsArray;
        });
    }
    getTeamIdsWithName(teamName) {
        return __awaiter(this, void 0, void 0, function* () {
            const allTeams = yield this.getDevelopmentTeams();
            const matchingTeamIds = allTeams.filter(team => team.name === teamName).map(team => team.id);
            return matchingTeamIds;
        });
    }
}
exports.IOSProvisionService = IOSProvisionService;
$injector.register("iOSProvisionService", IOSProvisionService);
