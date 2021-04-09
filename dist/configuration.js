"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SMSConfiguration = void 0;
const decorator_1 = require("@midwayjs/decorator");
const path_1 = require("path");
const JSON = require("@push.fun/midway-orm-json");
const TOOL = require("@push.fun/midway-tool");
let SMSConfiguration = class SMSConfiguration {
    async onReady(content) {
    }
};
__decorate([
    decorator_1.App(),
    __metadata("design:type", Object)
], SMSConfiguration.prototype, "app", void 0);
__decorate([
    decorator_1.Config(decorator_1.ALL),
    __metadata("design:type", Object)
], SMSConfiguration.prototype, "config", void 0);
SMSConfiguration = __decorate([
    decorator_1.Configuration({
        namespace: 'SMS',
        importConfigs: [
            path_1.join(__dirname, 'config')
        ],
        imports: [
            JSON,
            TOOL
        ]
    })
], SMSConfiguration);
exports.SMSConfiguration = SMSConfiguration;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlndXJhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIvVXNlcnMvUXVuL1VuY2x1dHRlci9taWR3YXktbGVybmEvcGFja2FnZXMvbWlkd2F5LXNtcy9zcmMvIiwic291cmNlcyI6WyJjb25maWd1cmF0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUNBLG1EQUFzRTtBQUN0RSwrQkFBNEI7QUFDNUIsa0RBQWlEO0FBQ2pELDhDQUE2QztBQVk3QyxJQUFhLGdCQUFnQixHQUE3QixNQUFhLGdCQUFnQjtJQVF6QixLQUFLLENBQUMsT0FBTyxDQUFDLE9BQXlCO0lBRXZDLENBQUM7Q0FDSixDQUFBO0FBUkc7SUFEQyxlQUFHLEVBQUU7OzZDQUNpQjtBQUd2QjtJQURDLGtCQUFNLENBQUMsZUFBRyxDQUFDOztnREFDRDtBQU5GLGdCQUFnQjtJQVY1Qix5QkFBYSxDQUFDO1FBQ1gsU0FBUyxFQUFFLEtBQUs7UUFDaEIsYUFBYSxFQUFFO1lBQ1gsV0FBSSxDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUM7U0FDNUI7UUFDRCxPQUFPLEVBQUU7WUFDTCxJQUFJO1lBQ0osSUFBSTtTQUNQO0tBQ0osQ0FBQztHQUNXLGdCQUFnQixDQVc1QjtBQVhZLDRDQUFnQiJ9