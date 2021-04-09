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
exports.SMS = void 0;
const decorator_1 = require("@midwayjs/decorator");
const Core = require("@alicloud/pop-core");
const midway_orm_json_1 = require("@push.fun/midway-orm-json");
const midway_tool_1 = require("@push.fun/midway-tool");
let SMS = class SMS {
    /**
     * <发送短信验证码>
     * @param phone 手机号
     * @param codes 验证码
     * @param template 模版配置信息key
     */
    async sendCode(phone, codes, template) {
        // 判断当前手机号是否重复发送
        const isPhone = await this.json.Get('SMS_CODE', {
            where: {
                phone
            },
            order: {
                id: 'DESC'
            }
        });
        if (isPhone.length !== 0) {
            // 判断验证码生产时间是否过期
            let timeOut = this.config.timeOut;
            let c = isPhone[0];
            let t = midway_tool_1.moment().isBetween(c.created_at, midway_tool_1.moment(c.created_at).add(timeOut, 's'));
            if (!t) {
                // 删除过期验证码，重新生成
                await this.json.Delete('SMS_CODE', {
                    where: {
                        phone
                    }
                });
            }
            else {
                return {
                    code: 2004,
                    message: '请勿重复发送！'
                };
            }
        }
        let client = new Core({
            accessKeyId: this.config.accessKeyId,
            accessKeySecret: this.config.accessKeySecret,
            endpoint: 'https://dysmsapi.aliyuncs.com',
            apiVersion: '2017-05-25'
        });
        let code = midway_tool_1.crypto.random(4, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
        let TemplateParam = codes ? { code: codes } : { code };
        let params = {
            "RegionId": "cn-hangzhou",
            "PhoneNumbers": phone,
            "SignName": this.config.SignName,
            "TemplateCode": template ? this.template[template] : eachTemplate(this.template),
            "TemplateParam": JSON.stringify(TemplateParam)
        };
        function eachTemplate(template) {
            for (let key in template) {
                return template[key];
            }
        }
        let requestOption = {
            method: 'POST'
        };
        const promise = new Promise((resolve, reject) => {
            client.request('SendSms', params, requestOption).then(async (result) => {
                if (result.Code == 'OK') {
                    // 防止发送延迟，验证时长3分钟内有效
                    await this.json.Add('SMS_CODE', {
                        data: { phone, code, template: params['TemplateCode'] }
                    });
                    resolve({ code: 2000, message: null });
                }
                else {
                    resolve({ code: 2003, message: '短信发送失败' });
                }
            }, (err) => {
                resolve({ code: 2002, message: err.data.Message });
            });
        });
        return promise;
    }
    /**
     * <验证短信验证码是否正确>
     * @param phone 手机号
     * @param code 验证码
     */
    async verifyCode(phone, code, template) {
        let where = { phone, code };
        if (template)
            where.template = template;
        const isPhone = await this.json.Get('SMS_CODE', {
            where, order: {
                id: 'DESC'
            }
        });
        if (isPhone.length === 0)
            return { code: 2004, message: '请获取最新的验证码！' };
        let codeStatus = false;
        for (let i = 0, len = isPhone.length; i < len; i++) {
            const timeOut = this.config.timeOut;
            const c = isPhone[i];
            const t = midway_tool_1.moment().isBetween(c.created_at, midway_tool_1.moment(c.created_at).add(timeOut, 's'));
            // 验证码未过期并符合校验规则
            if (t)
                codeStatus = true;
        }
        await this.json.Delete('SMS_CODE', {
            where: { phone }
        });
        if (!codeStatus)
            return {
                code: 2003,
                message: '请您获取最新的验证码！'
            };
        // 验证通过
        return { code: 2000, message: null };
    }
    /**
     * <发送消息通知模版短信>
     * @param phone 手机号
     * @param param 消息参数对象
     * @param template 模版配置信息key
     */
    async sendMessage(phone, param, template) {
        let client = new Core({
            accessKeyId: this.config.accessKeyId,
            accessKeySecret: this.config.accessKeySecret,
            endpoint: 'https://dysmsapi.aliyuncs.com',
            apiVersion: '2017-05-25'
        });
        let params = {
            "RegionId": "cn-hangzhou",
            "PhoneNumbers": phone,
            "SignName": this.config.SignName,
            "TemplateCode": template ? this.template[template] : eachTemplate(this.template),
            "TemplateParam": JSON.stringify(param)
        };
        function eachTemplate(template) {
            for (let key in template) {
                return template[key];
            }
        }
        let requestOption = {
            method: 'POST'
        };
        const promise = new Promise((resolve, reject) => {
            client.request('SendSms', params, requestOption).then(async (result) => {
                if (result.Code == 'OK') {
                    resolve({ code: 2000, message: null });
                }
                else {
                    resolve({ code: 2003, message: '短信发送失败' });
                }
            }, (err) => {
                resolve({ code: 2002, message: err.data.Message });
            });
        });
        return promise;
    }
};
__decorate([
    decorator_1.Inject(),
    __metadata("design:type", Object)
], SMS.prototype, "ctx", void 0);
__decorate([
    decorator_1.Inject('JSON:json'),
    __metadata("design:type", midway_orm_json_1.Json)
], SMS.prototype, "json", void 0);
__decorate([
    decorator_1.Logger(),
    __metadata("design:type", Object)
], SMS.prototype, "logger", void 0);
__decorate([
    decorator_1.Config('sms_config'),
    __metadata("design:type", Object)
], SMS.prototype, "config", void 0);
__decorate([
    decorator_1.Config('sms_template'),
    __metadata("design:type", Object)
], SMS.prototype, "template", void 0);
SMS = __decorate([
    decorator_1.Provide()
], SMS);
exports.SMS = SMS;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic21zLmpzIiwic291cmNlUm9vdCI6Ii9Vc2Vycy9RdW4vVW5jbHV0dGVyL21pZHdheS1sZXJuYS9wYWNrYWdlcy9taWR3YXktc21zL3NyYy8iLCJzb3VyY2VzIjpbInNlcnZpY2Uvc21zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLG1EQUFzRTtBQUV0RSwyQ0FBMEM7QUFDMUMsK0RBQWlEO0FBQ2pELHVEQUFzRDtBQUd0RCxJQUFhLEdBQUcsR0FBaEIsTUFBYSxHQUFHO0lBbUJaOzs7OztPQUtHO0lBQ0gsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFhLEVBQUUsS0FBdUIsRUFBRSxRQUFpQjtRQU1wRSxnQkFBZ0I7UUFDaEIsTUFBTSxPQUFPLEdBQUcsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUU7WUFDNUMsS0FBSyxFQUFFO2dCQUNILEtBQUs7YUFDUjtZQUNELEtBQUssRUFBRTtnQkFDSCxFQUFFLEVBQUUsTUFBTTthQUNiO1NBQ0osQ0FBQyxDQUFBO1FBQ0YsSUFBSSxPQUFPLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUN0QixnQkFBZ0I7WUFDaEIsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUE7WUFDakMsSUFBSSxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ2xCLElBQUksQ0FBQyxHQUFHLG9CQUFNLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFVBQVUsRUFBRSxvQkFBTSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUE7WUFDaEYsSUFBSSxDQUFDLENBQUMsRUFBRTtnQkFDSixlQUFlO2dCQUNmLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFO29CQUMvQixLQUFLLEVBQUU7d0JBQ0gsS0FBSztxQkFDUjtpQkFDSixDQUFDLENBQUE7YUFDTDtpQkFBTTtnQkFDSCxPQUFPO29CQUNILElBQUksRUFBRSxJQUFJO29CQUNWLE9BQU8sRUFBRSxTQUFTO2lCQUNyQixDQUFBO2FBQ0o7U0FDSjtRQUVELElBQUksTUFBTSxHQUFHLElBQUksSUFBSSxDQUFDO1lBQ2xCLFdBQVcsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVc7WUFDcEMsZUFBZSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsZUFBZTtZQUM1QyxRQUFRLEVBQUUsK0JBQStCO1lBQ3pDLFVBQVUsRUFBRSxZQUFZO1NBQzNCLENBQUMsQ0FBQTtRQUNGLElBQUksSUFBSSxHQUFHLG9CQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDM0QsSUFBSSxhQUFhLEdBQVEsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQTtRQUMzRCxJQUFJLE1BQU0sR0FBRztZQUNULFVBQVUsRUFBRSxhQUFhO1lBQ3pCLGNBQWMsRUFBRSxLQUFLO1lBQ3JCLFVBQVUsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVE7WUFDaEMsY0FBYyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUM7WUFDaEYsZUFBZSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDO1NBQ2pELENBQUE7UUFDRCxTQUFTLFlBQVksQ0FBQyxRQUFnQjtZQUNsQyxLQUFLLElBQUksR0FBRyxJQUFJLFFBQVEsRUFBRTtnQkFDdEIsT0FBTyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUE7YUFDdkI7UUFDTCxDQUFDO1FBQ0QsSUFBSSxhQUFhLEdBQUc7WUFDaEIsTUFBTSxFQUFFLE1BQU07U0FDakIsQ0FBQTtRQUVELE1BQU0sT0FBTyxHQUFRLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1lBQ2pELE1BQU0sQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLE1BQU0sRUFBRSxhQUFhLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLE1BQVcsRUFBRSxFQUFFO2dCQUN4RSxJQUFJLE1BQU0sQ0FBQyxJQUFJLElBQUksSUFBSSxFQUFFO29CQUNyQixvQkFBb0I7b0JBQ3BCLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFO3dCQUM1QixJQUFJLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxNQUFNLENBQUMsY0FBYyxDQUFDLEVBQUU7cUJBQzFELENBQUMsQ0FBQTtvQkFDRixPQUFPLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFBO2lCQUN6QztxQkFBTTtvQkFDSCxPQUFPLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFBO2lCQUM3QztZQUNMLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFO2dCQUNQLE9BQU8sQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQTtZQUN0RCxDQUFDLENBQUMsQ0FBQTtRQUNOLENBQUMsQ0FBQyxDQUFBO1FBRUYsT0FBTyxPQUFPLENBQUE7SUFDbEIsQ0FBQztJQUdEOzs7O09BSUc7SUFDSCxLQUFLLENBQUMsVUFBVSxDQUFDLEtBQWEsRUFBRSxJQUFxQixFQUFFLFFBQWlCO1FBRXBFLElBQUksS0FBSyxHQUFRLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxDQUFBO1FBQ2hDLElBQUcsUUFBUTtZQUFFLEtBQUssQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFBO1FBQ3RDLE1BQU0sT0FBTyxHQUFHLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFO1lBQzVDLEtBQUssRUFBRSxLQUFLLEVBQUU7Z0JBQ1YsRUFBRSxFQUFFLE1BQU07YUFDYjtTQUNKLENBQUMsQ0FBQTtRQUNGLElBQUksT0FBTyxDQUFDLE1BQU0sS0FBSyxDQUFDO1lBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLFlBQVksRUFBRSxDQUFBO1FBRXRFLElBQUksVUFBVSxHQUFHLEtBQUssQ0FBQTtRQUN0QixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ2hELE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFBO1lBQ25DLE1BQU0sQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUNwQixNQUFNLENBQUMsR0FBRyxvQkFBTSxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxVQUFVLEVBQUUsb0JBQU0sQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFBO1lBQ2xGLGdCQUFnQjtZQUNoQixJQUFJLENBQUM7Z0JBQUUsVUFBVSxHQUFHLElBQUksQ0FBQTtTQUMzQjtRQUVELE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFO1lBQy9CLEtBQUssRUFBRSxFQUFFLEtBQUssRUFBRTtTQUNuQixDQUFDLENBQUE7UUFFRixJQUFJLENBQUMsVUFBVTtZQUFFLE9BQU87Z0JBQ3BCLElBQUksRUFBRSxJQUFJO2dCQUNWLE9BQU8sRUFBRSxhQUFhO2FBQ3pCLENBQUE7UUFFRCxPQUFPO1FBQ1AsT0FBTyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxDQUFBO0lBQ3hDLENBQUM7SUFJRDs7Ozs7T0FLRztJQUNILEtBQUssQ0FBQyxXQUFXLENBQUMsS0FBYSxFQUFFLEtBQWEsRUFBRSxRQUFpQjtRQUM3RCxJQUFJLE1BQU0sR0FBRyxJQUFJLElBQUksQ0FBQztZQUNsQixXQUFXLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXO1lBQ3BDLGVBQWUsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLGVBQWU7WUFDNUMsUUFBUSxFQUFFLCtCQUErQjtZQUN6QyxVQUFVLEVBQUUsWUFBWTtTQUMzQixDQUFDLENBQUM7UUFDSCxJQUFJLE1BQU0sR0FBRztZQUNULFVBQVUsRUFBRSxhQUFhO1lBQ3pCLGNBQWMsRUFBRSxLQUFLO1lBQ3JCLFVBQVUsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVE7WUFDaEMsY0FBYyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUM7WUFDaEYsZUFBZSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDO1NBQ3pDLENBQUE7UUFDRCxTQUFTLFlBQVksQ0FBQyxRQUFnQjtZQUNsQyxLQUFLLElBQUksR0FBRyxJQUFJLFFBQVEsRUFBRTtnQkFDdEIsT0FBTyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUE7YUFDdkI7UUFDTCxDQUFDO1FBQ0QsSUFBSSxhQUFhLEdBQUc7WUFDaEIsTUFBTSxFQUFFLE1BQU07U0FDakIsQ0FBQztRQUVGLE1BQU0sT0FBTyxHQUFHLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1lBQzVDLE1BQU0sQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLE1BQU0sRUFBRSxhQUFhLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLE1BQVcsRUFBRSxFQUFFO2dCQUN4RSxJQUFJLE1BQU0sQ0FBQyxJQUFJLElBQUksSUFBSSxFQUFFO29CQUNyQixPQUFPLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFBO2lCQUN6QztxQkFBTTtvQkFDSCxPQUFPLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFBO2lCQUM3QztZQUNMLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFO2dCQUNQLE9BQU8sQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQTtZQUN0RCxDQUFDLENBQUMsQ0FBQTtRQUNOLENBQUMsQ0FBQyxDQUFBO1FBRUYsT0FBTyxPQUFPLENBQUE7SUFDbEIsQ0FBQztDQUNKLENBQUE7QUF4TEc7SUFEQyxrQkFBTSxFQUFFOztnQ0FDRDtBQUdSO0lBREMsa0JBQU0sQ0FBQyxXQUFXLENBQUM7OEJBQ2Qsc0JBQUk7aUNBQUE7QUFHVjtJQURDLGtCQUFNLEVBQUU7O21DQUNNO0FBR2Y7SUFEQyxrQkFBTSxDQUFDLFlBQVksQ0FBQzs7bUNBQ1Y7QUFHWDtJQURDLGtCQUFNLENBQUMsY0FBYyxDQUFDOztxQ0FDVjtBQWZKLEdBQUc7SUFEZixtQkFBTyxFQUFFO0dBQ0csR0FBRyxDQTJMZjtBQTNMWSxrQkFBRyJ9