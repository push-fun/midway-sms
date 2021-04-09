import { ILifeCycle, IMidwayApplication, IMidwayContainer } from '@midwayjs/core';
export declare class SMSConfiguration implements ILifeCycle {
    app: IMidwayApplication;
    config: any;
    onReady(content: IMidwayContainer): Promise<void>;
}
