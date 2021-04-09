import { ILogger } from '@midwayjs/logger';
import { Json } from '@push.fun/midway-orm-json';
export declare class SMS {
    ctx: any;
    json: Json;
    logger: ILogger;
    config: any;
    template: any;
    /**
     * <发送短信验证码>
     * @param phone 手机号
     * @param codes 验证码
     * @param template 模版配置信息key
     */
    sendCode(phone: string, codes?: string | number, template?: string): Promise<{
        code: number;
        message: any;
    }>;
    /**
     * <验证短信验证码是否正确>
     * @param phone 手机号
     * @param code 验证码
     */
    verifyCode(phone: string, code: number | string, template?: string): Promise<{
        code: number;
        message: string;
    }>;
    /**
     * <发送消息通知模版短信>
     * @param phone 手机号
     * @param param 消息参数对象
     * @param template 模版配置信息key
     */
    sendMessage(phone: string, param: object, template?: string): Promise<unknown>;
}
