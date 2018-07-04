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
const device_discovery_1 = require("./device-discovery");
const ios_simulator_device_1 = require("./../ios/simulator/ios-simulator-device");
class IOSSimulatorDiscovery extends device_discovery_1.DeviceDiscovery {
    constructor($injector, $iOSSimResolver, $mobileHelper, $hostInfo) {
        super();
        this.$injector = $injector;
        this.$iOSSimResolver = $iOSSimResolver;
        this.$mobileHelper = $mobileHelper;
        this.$hostInfo = $hostInfo;
        this.cachedSimulators = [];
    }
    startLookingForDevices(options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (options && options.platform && !this.$mobileHelper.isiOSPlatform(options.platform)) {
                return;
            }
            return this.checkForDevices();
        });
    }
    checkForDevices() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.$hostInfo.isDarwin) {
                const currentSimulators = yield this.$iOSSimResolver.iOSSim.getRunningSimulators();
                _(this.cachedSimulators)
                    .reject(s => _.find(currentSimulators, simulator => simulator && s && simulator.id === s.id && simulator.state === s.state))
                    .each(s => this.deleteAndRemoveDevice(s));
                _(currentSimulators)
                    .reject(s => _.find(this.cachedSimulators, simulator => simulator && s && simulator.id === s.id && simulator.state === s.state))
                    .each(s => this.createAndAddDevice(s));
            }
        });
    }
    createAndAddDevice(simulator) {
        this.cachedSimulators.push(_.cloneDeep(simulator));
        this.addDevice(this.$injector.resolve(ios_simulator_device_1.IOSSimulator, { simulator: simulator }));
    }
    deleteAndRemoveDevice(simulator) {
        _.remove(this.cachedSimulators, s => s && s.id === simulator.id);
        this.removeDevice(simulator.id);
    }
}
exports.IOSSimulatorDiscovery = IOSSimulatorDiscovery;
$injector.register("iOSSimulatorDiscovery", IOSSimulatorDiscovery);
