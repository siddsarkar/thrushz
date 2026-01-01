import { logInterceptor } from '@/api/interceptor';
import { uuidv4 } from '@/utils/uuid';

// Type definitions
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
export type ResponseType = 'json' | 'text' | 'blob' | 'arrayBuffer';

export interface HttpClientConfig {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export interface RequestConfig {
  id: string;
  url: string;
  method: HttpMethod;
  headers: Record<string, string>;
  body?: string;
}

export interface RequestOptions {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, string | number>;
  responseType?: ResponseType;
}

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
  ok: boolean;
  requestId: string;
}

export interface ApiError extends Error {
  response?: ApiResponse;
}

export type RequestInterceptor = (
  config: RequestConfig
) => Promise<RequestConfig> | RequestConfig;
export type ResponseInterceptor = <T>(
  response: ApiResponse<T>
) => Promise<ApiResponse<T>> | ApiResponse<T>;

export interface IHttpClient {
  // Interceptors
  addRequestInterceptor(interceptor: RequestInterceptor): void;
  addResponseInterceptor(interceptor: ResponseInterceptor): void;

  // Main request method
  request<T>(
    endpoint: string,
    options: RequestOptions
  ): Promise<ApiResponse<T>>;

  // Conventional methods
  get<T>(endpoint: string, options: RequestOptions): Promise<ApiResponse<T>>;
  post<T>(
    endpoint: string,
    body: any,
    options: RequestOptions
  ): Promise<ApiResponse<T>>;
  put<T>(
    endpoint: string,
    body: any,
    options: RequestOptions
  ): Promise<ApiResponse<T>>;
  patch<T>(
    endpoint: string,
    body: any,
    options: RequestOptions
  ): Promise<ApiResponse<T>>;
  delete<T>(endpoint: string, options: RequestOptions): Promise<ApiResponse<T>>;
}

export class HttpClient implements IHttpClient {
  private baseURL: string;
  private timeout: number;
  private headers: Record<string, string>;
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];

  constructor(config: HttpClientConfig = {}) {
    this.baseURL = config.baseURL || '';
    this.timeout = config.timeout || 30000;
    this.headers = config.headers || {};
  }

  // Add request interceptor
  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
  }

  // Add response interceptor
  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor);
  }

  // Apply request interceptors
  private async applyRequestInterceptors(
    config: RequestConfig
  ): Promise<RequestConfig> {
    let modifiedConfig = { ...config };
    for (const interceptor of this.requestInterceptors) {
      modifiedConfig = await interceptor(modifiedConfig);
    }
    return modifiedConfig;
  }

  // Apply response interceptors
  private async applyResponseInterceptors<T>(
    response: ApiResponse<T>
  ): Promise<ApiResponse<T>> {
    let modifiedResponse = response;
    for (const interceptor of this.responseInterceptors) {
      modifiedResponse = await interceptor(modifiedResponse);
    }
    return modifiedResponse;
  }
  // Build full URL
  private buildURL(
    endpoint: string,
    params?: Record<string, string | number>
  ): string {
    if (params) {
      const searchParams = new URLSearchParams();
      Object.keys(params).forEach((key) =>
        searchParams.append(key, String(params[key]))
      );
      return `${this.baseURL}${endpoint}?${searchParams.toString()}`;
    }
    return `${this.baseURL}${endpoint}`;
  }

  // Main request method
  async request<T = any>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    let id = uuidv4();

    const {
      method = 'GET',
      headers = {},
      body,
      params,
      responseType = 'json',
      ...rest
    } = options;

    // Build request config
    let config: RequestConfig = {
      id,
      url: this.buildURL(endpoint, params),
      method,
      headers: { ...this.headers, ...headers },
      ...(body ? { body: JSON.stringify(body) } : {}),
    };

    // Apply request interceptors
    config = await this.applyRequestInterceptors(config);

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      // this.logger.info('[HTTP] Request => ', config.url.replace(this.baseURL, ''));
      // Make fetch request
      const response = await fetch(config.url, {
        method: config.method,
        headers: config.headers,
        body: config.body,
        signal: controller.signal,
        ...rest,
      });

      clearTimeout(timeoutId);

      // Parse response based on type
      let data: any;
      if (responseType === 'json') {
        // Read as text first to enable error logging if JSON parsing fails
        const text = await response.text();
        try {
          data = JSON.parse(text);
        } catch (parseError) {
          console.error('[HttpClient] JSON parse error', {
            error: parseError,
            response: text.slice(0, 200),
          });
          data = null;
        }
      } else if (responseType === 'text') {
        data = await response.text();
      } else if (responseType === 'blob') {
        data = await response.blob();
      } else {
        data = await response.arrayBuffer();
      }

      const result: ApiResponse<T> = {
        requestId: id,
        data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        ok: response.ok,
      };

      // Apply response interceptors
      const finalResult = await this.applyResponseInterceptors(result);

      // Throw error if response not ok
      if (!response.ok) {
        const error: ApiError = new Error(
          `HTTP ${response.status}: ${response.statusText}`
        );
        error.response = finalResult;
        throw error;
      }

      return finalResult;
    } catch (error) {
      clearTimeout(timeoutId);

      if ((error as Error).name === 'AbortError') {
        throw new Error('Request timeout');
      }

      throw error;
    }
  }

  // Convenience methods
  get<T = any>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  post<T = any>(
    endpoint: string,
    body?: any,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body });
  }

  put<T = any>(
    endpoint: string,
    body?: any,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body });
  }

  patch<T = any>(
    endpoint: string,
    body?: any,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'PATCH', body });
  }

  delete<T = any>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export interface IHttpClientFactory {
  create(config: HttpClientConfig): HttpClient;
}

export class HttpClientFactory implements IHttpClientFactory {
  create(config: HttpClientConfig = {}): HttpClient {
    const client = new HttpClient(config);

    client.addRequestInterceptor(
      logInterceptor.interceptRequest.bind(logInterceptor)
    );
    client.addResponseInterceptor(
      logInterceptor.interceptResponse.bind(logInterceptor)
    );

    return client;
  }
}

export const httpClientFactory = new HttpClientFactory();
