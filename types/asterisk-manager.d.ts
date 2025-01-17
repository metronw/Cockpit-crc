declare module 'asterisk-manager' {
  interface ActionParams {
    [key: string]: any;
  }

  type EventCallback = (evt: any) => void;
  type ActionCallback = (err: any, res: any) => void;

  class Manager {
    constructor(
      port: number,
      host: string,
      username: string,
      password: string,
      keepAlive?: boolean
    );
    keepConnected(): void;
    on(event: 'managerevent', callback: EventCallback): this;
    on(event: 'response', callback: EventCallback): this;
    on(event: string, callback: EventCallback): this;
    action(params: ActionParams, callback: ActionCallback): void;
    disconnect(): void;
  }

  export default Manager;
}
