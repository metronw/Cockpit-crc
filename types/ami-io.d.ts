declare module 'ami-io' {
  export class SilentLogger {
    trace(message: string): void;
    debug(message: string): void;
    info(message: string): void;
    warn(message: string): void;
    error(message: string): void;
    fatal(message: string): void;
  }

  export interface ClientOptions {
    host?: string;
    port?: number;
    login?: string;
    password?: string;
    encoding?: string;
    logger?: SilentLogger;
  }

  export class Client {
    constructor(options?: ClientOptions);
    on(event: string, listener: (...args: any[]) => void): this;
    connect(shouldReconnect?: boolean, reconnectTimeout?: number): void;
    disconnect(): void;
    send(action: Action, callback?: (err: any, data: any) => void): Promise<any>;
    useLogger(logger: SilentLogger): void;
    logger: SilentLogger; // Adicionado
  }

  export function createClient(options?: ClientOptions): Client;

  export namespace Action {
    class QueuePause {
      interface: string;
      paused: string;
      reason?: string;
      constructor();
    }

    class QueueStatus {
      queue?: string;
      constructor();
    }

    // Adicione outras ações conforme necessário
  }
}
