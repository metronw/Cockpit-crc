declare module 'asterisk-ami' {
  interface AmiClientOptions {
    host: string;
    port: number;
    username: string;
    password: string;
    reconnect?: boolean;
    events?: boolean;
  }

  interface BaseAmiAction {
    action: string;
  }

  interface QueuePauseAction extends BaseAmiAction {
    action: 'QueuePause';
    Interface: string;
    Paused: 'true' | 'false';
    Reason?: string;
  }

  interface QueueStatusAction extends BaseAmiAction {
    action: 'QueueStatus';
  }

  type AmiAction = QueuePauseAction | QueueStatusAction;

  interface BaseAmiResponse {
    response: string;
    event?: string;
    [key: string]: unknown;
  }

  interface QueueMemberResponse extends BaseAmiResponse {
    event: 'QueueMember';
    stateinterface: string;
    paused: '1' | '0';
  }

  interface QueueStatusCompleteResponse extends BaseAmiResponse {
    event: 'QueueStatusComplete';
  }

  type AmiResponse = QueueMemberResponse | QueueStatusCompleteResponse | BaseAmiResponse;

  type AmiCallback = (err: Error | null, response: AmiResponse) => void;

  export default class AsteriskAmi {
    constructor(options: AmiClientOptions);
    connect(callback: (err: Error | null) => void): void;
    disconnect(): void;
    send(action: AmiAction, callback?: AmiCallback): void;
    on(event: string, listener: (data: AmiResponse) => void): void;
    off(event: string, listener: (data: AmiResponse) => void): void;
  }
}
