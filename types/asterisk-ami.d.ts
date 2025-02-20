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

  interface QueueAddMemberAction extends BaseAmiAction {
    action: 'QueueAdd';
    Queue: string;
    Interface: string;
  }

  interface QueueRemoveAction extends BaseAmiAction {
    action: 'QueueRemove';
    ActionID: string;
    Queue: string;
    Interface: string;
  }

  interface QueueSummaryAction extends BaseAmiAction {
    action: 'QueueSummary';
    Queue: string;
  }

  interface AgentsAction extends BaseAmiAction {
    action: 'Agents';
  }

  interface CoreShowChannelsAction extends BaseAmiAction {
    action: 'CoreShowChannels';
    ActionID?: string;
  }

  interface PJSIPShowContactsAction extends BaseAmiAction {
    action: 'PJSIPShowContacts';
    // Adicione quaisquer outros parâmetros necessários aqui
  }

  type AmiAction =
    | QueuePauseAction
    | QueueStatusAction
    | QueueAddMemberAction
    | QueueRemoveAction
    | QueueSummaryAction
    | AgentsAction
    | CoreShowChannelsAction
    | PJSIPShowContactsAction;

  interface BaseAmiResponse {
    response: string;
    event?: string;
    [key: string]: unknown;
  }

  interface QueueMemberResponse extends BaseAmiResponse {
    event: 'QueueMember';
    Queue: string; // Adicionada a propriedade Queue
    Interface: string; // Adicionada a propriedade Interface
    paused: '1' | '0';
  }

  interface QueueStatusCompleteResponse extends BaseAmiResponse {
    event: 'QueueStatusComplete';
  }

  interface QueueSummaryResponse extends BaseAmiResponse {
    event: 'QueueSummary';
    Queue: string;
    LoggedIn: string;
    Available: string;
    Callers: string;
    HoldTime: string;
    TalkTime: string;
    LongestHoldTime: string;
  }

  interface QueueEntryResponse extends BaseAmiResponse {
    event: 'QueueEntry';
    Queue: string;
    Position: string;
    Channel: string;
    Uniqueid: string;
    CallerIDNum: string;
    CallerIDName: string;
    ConnectedLineNum: string;
    ConnectedLineName: string;
    Wait: string;
    Priority: string;
    ActionID: string;
  }

  interface AgentsResponse extends BaseAmiResponse {
    event: 'Agents';
    Agent: string;
    Name: string;
    Status: 'AGENT_LOGGEDOFF' | 'AGENT_IDLE' | 'AGENT_ONCALL' | 'AGENT_RINGING' | 'AGENT_BUSY';
    TalkingToChan?: string;
    CallStarted?: string;
    LoggedInTime?: string;
    Channel?: string;
    ChannelState?: string;
    ChannelStateDesc?: string;
    CallerIDNum?: string;
    CallerIDName?: string;
    ConnectedLineNum?: string;
    ConnectedLineName?: string;
    Language?: string;
    AccountCode?: string;
    Context?: string;
    Exten?: string;
    Priority?: string;
    Uniqueid?: string;
    Linkedid?: string;
    ActionID?: string;
  }

  interface CoreShowChannelEvent extends BaseAmiResponse {
    event: 'CoreShowChannel';
    Channel: string;
    Uniqueid: string;
    ChannelVariables?: {
      Queue?: string; // Propriedade opcional para evitar erro no TS
      [key: string]: unknown;
    };
  }

  interface CoreShowChannelsCompleteEvent extends BaseAmiResponse {
    event: 'CoreShowChannelsComplete';
    eventlist?: 'Complete';
  }

  interface QueueLogRow {
    time: string;
    callid: string;
    queuename: string;
    agent: string;
    event: string;
    data1: string;
    data2: string;
    data3: string;
  }

  type AmiResponse =
    | QueueMemberResponse
    | QueueStatusCompleteResponse
    | QueueSummaryResponse
    | QueueEntryResponse
    | AgentsResponse
    | CoreShowChannelEvent
    | CoreShowChannelsCompleteEvent
    | BaseAmiResponse;

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
