import type { JsonRpcRequest, JsonRpcResponse, Address } from '@aboutcircles/sdk-types';
import { Observable, parseRpcSubscriptionMessage } from './events';
import type { CirclesEvent } from './events';
import { RpcError } from './errors';

/**
 * Base RPC client for making JSON-RPC calls to Circles RPC endpoints
 * Supports both HTTP requests and WebSocket subscriptions
 */
export class RpcClient {
  private rpcUrl: string;
  private requestId: number = 0;

  // WebSocket fields
  private websocket: WebSocket | null = null;
  private websocketConnected = false;
  private pendingResponses: Record<number, any> = {};
  private subscriptionListeners: {
    [subscriptionId: string]: ((event: { event: string, values: Record<string, any> }[]) => void)[]
  } = {};

  // Backoff-related fields for reconnection
  private reconnectAttempt = 0;
  private readonly initialBackoff = 2000; // 2 seconds
  private readonly maxBackoff = 120000; // 2 minutes

  constructor(rpcUrl: string) {
    this.rpcUrl = rpcUrl;
  }

  /**
   * Make a JSON-RPC call
   */
  async call<TParams = unknown[], TResult = unknown>(
    method: string,
    params: TParams
  ): Promise<TResult> {
    this.requestId++;

    const request: JsonRpcRequest<TParams> = {
      jsonrpc: '2.0',
      id: this.requestId,
      method,
      params,
    };

    try {
      const response = await fetch(this.rpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw RpcError.connectionFailed(
          this.rpcUrl,
          new Error(`HTTP ${response.status}: ${response.statusText}`)
        );
      }

      const jsonResponse = await response.json() as JsonRpcResponse<TResult>;

      if (jsonResponse.error) {
        throw RpcError.fromJsonRpcError(jsonResponse.error);
      }

      if (jsonResponse.result === undefined) {
        throw RpcError.invalidResponse(method, jsonResponse);
      }

      return jsonResponse.result;
    } catch (error) {
      if (error instanceof RpcError) {
        throw error;
      }
      throw RpcError.connectionFailed(this.rpcUrl, error);
    }
  }

  /**
   * Update the RPC URL
   */
  setRpcUrl(rpcUrl: string): void {
    this.rpcUrl = rpcUrl;
  }

  /**
   * Get the current RPC URL
   */
  getRpcUrl(): string {
    return this.rpcUrl;
  }

  /**
   * Initiates a WebSocket connection
   * @private
   */
  private connect(): Promise<void> {
    return new Promise<void>((resolve) => {
      let wsUrl = this.rpcUrl.replace('http', 'ws');
      if (wsUrl.endsWith('/')) {
        wsUrl += 'ws/subscribe';
      } else {
        wsUrl += '/ws/subscribe';
      }
      this.websocket = new WebSocket(wsUrl);

      this.websocket.onopen = () => {
        console.log('WebSocket connected');
        this.websocketConnected = true;
        // Reset the reconnect backoff attempts
        this.reconnectAttempt = 0;
        resolve();
      };

      this.websocket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        const { id, method, params } = message;

        if (id !== undefined && this.pendingResponses[id]) {
          this.pendingResponses[id].resolve(message);
          delete this.pendingResponses[id];
        }

        // Handle server event push: { method: "circles_subscription", params: { result: [...] } }
        if (method === 'circles_subscription' && params?.result) {
          // Server broadcasts to all subscribers, so notify all listeners
          Object.values(this.subscriptionListeners).forEach(listeners => {
            listeners.forEach(listener => listener(params.result));
          });
        }
      };

      this.websocket.onclose = () => {
        console.warn('WebSocket closed');
        this.websocketConnected = false;
      };

      this.websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.websocketConnected = false;
        // Schedule a reconnect
        this.scheduleReconnect();
      };
    });
  }

  /**
   * Schedules a reconnect using exponential backoff with random jitter
   * @private
   */
  private scheduleReconnect(): void {
    // Exponential backoff: 2^attempt * initialBackoff
    const delay = Math.min(
      this.initialBackoff * Math.pow(2, this.reconnectAttempt),
      this.maxBackoff
    );

    // Add proportional jitter (between 0% and 50% of the delay)
    const jitter = delay * (Math.random() * 0.5);
    const timeout = delay + jitter;

    console.log(
      `Reconnecting in ${Math.round(timeout)}ms (attempt #${this.reconnectAttempt + 1})`
    );
    this.reconnectAttempt++;

    setTimeout(() => {
      this.reconnect();
    }, timeout);
  }

  /**
   * Attempts to reconnect the WebSocket
   * @private
   */
  private async reconnect(): Promise<void> {
    if (this.websocketConnected) return;
    try {
      await this.connect();
      console.log('Reconnection successful');
    } catch (err) {
      console.error('Reconnection attempt failed:', err);
      this.scheduleReconnect();
    }
  }

  /**
   * Sends a message over WebSocket
   * @private
   */
  private sendMessage(method: string, params: any, timeout = 5000): Promise<any> {
    if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN) {
      return Promise.reject(RpcError.connectionFailed(this.rpcUrl));
    }
    const id = this.requestId++;
    const message = { jsonrpc: '2.0', method, params, id };
    return new Promise((resolve, reject) => {
      this.pendingResponses[id] = { resolve, reject };
      this.websocket!.send(JSON.stringify(message));

      setTimeout(() => {
        if (this.pendingResponses[id]) {
          this.pendingResponses[id].reject(RpcError.timeout(method, timeout));
          delete this.pendingResponses[id];
        }
      }, timeout);
    });
  }

  /**
   * Subscribe to Circles events via WebSocket
   * @param address Optional address to filter events for a specific avatar
   * @returns Observable that emits CirclesEvent objects
   */
  async subscribe(address?: Address): Promise<Observable<CirclesEvent>> {
    const normalizedAddress = address?.toLowerCase() as Address | undefined;

    if (!this.websocketConnected) {
      await this.connect();
    }

    const observable = Observable.create<CirclesEvent>();
    // Server expects: { method: "circles_subscribe", params: { address: "0x..." } }
    const subscriptionParams = normalizedAddress ? { address: normalizedAddress } : {};
    const response = await this.sendMessage('circles_subscribe', subscriptionParams);
    const subscriptionId = response.result;

    if (!this.subscriptionListeners[subscriptionId]) {
      this.subscriptionListeners[subscriptionId] = [];
    }

    this.subscriptionListeners[subscriptionId].push((events) => {
      parseRpcSubscriptionMessage(events).forEach(event => observable.emit(event));
    });

    return observable.property;
  }
}
