declare module 'asterisk-ami' {
  interface AmiClientOptions {
    host: string;
    port: number;
    username: string;
    password: string;
    reconnect?: boolean;
    events?: boolean;
  }

  interface AmiAction {
    action: string;
    [key: string]: any;
  }

  interface AmiResponse {
    response: string;
    [key: string]: any;
  }

  type AmiCallback = (err: Error | null, response: AmiResponse) => void;

  export default class AsteriskAmi {
    constructor(options: AmiClientOptions);
    connect(callback: (err: Error | null) => void): void;
    disconnect(): void;
    send(action: AmiAction, callback?: AmiCallback): void;
    on(event: string, listener: (data: Record<string, any>) => void): void;
    off(event: string, listener: (data: Record<string, any>) => void): void;
  }
}
