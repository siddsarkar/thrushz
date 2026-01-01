import { BehaviorSubject, map, Observable } from 'rxjs';

import { ApiResponse, RequestConfig } from '@/api/http';

export type RequestLog = {
  request: RequestConfig | undefined;
  response: ApiResponse<any> | undefined;
};

export type CallbackFunction = (logs: RequestLog[]) => void;

class Tuple<T, U> {
  constructor(
    public first: T,
    public second: U
  ) {}
}

class LogInterceptor {
  private maxLogs = 10;
  private logs = new BehaviorSubject<
    Map<string, Tuple<RequestConfig | undefined, ApiResponse<any> | undefined>>
  >(new Map());

  async interceptRequest(config: RequestConfig): Promise<RequestConfig> {
    let requestId = config.id;
    console.log(`[${requestId}] Request => `, config.url);
    let log = this.logs.getValue();
    if (log.size >= this.maxLogs) {
      log.delete(log.keys().next().value || '');
    }
    log.set(requestId, new Tuple(config, undefined));
    this.logs.next(log);
    return config;
  }

  async interceptResponse<T>(
    response: ApiResponse<T>
  ): Promise<ApiResponse<T>> {
    let logId = response.requestId;
    console.log(
      `[${logId}] Response => `,
      JSON.stringify(response.data, null, 2).substring(0, 200) +
        '\n...response truncated'
    );
    let log = this.logs.getValue();
    let tuple = log.get(logId);
    if (tuple) {
      tuple.second = response;
      log.set(logId, tuple);
    }

    this.logs.next(log);

    return response;
  }

  getLogs(): Observable<RequestLog[]> {
    return this.logs.asObservable().pipe(
      map((obj) =>
        new Array(...obj.values()).map((log) => ({
          request: log.first,
          response: log.second,
        }))
      )
    );
  }
}

export const logInterceptor = new LogInterceptor();
