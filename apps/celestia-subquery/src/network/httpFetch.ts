import { request as httpRequest } from "http";
import { request as httpsRequest } from "https";

type HttpFetchOptions = {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
  timeout?: number;
};

type HttpResponse = {
  ok: boolean;
  status: number;
  json(): Promise<any>;
};

const MAX_RESPONSE_BYTES = 32 * 1024 * 1024;
const MAX_REDIRECTS = 3;

/** HTTP JSON transport that works inside SubQuery's mapping sandbox. */
export default function httpFetch(
  url: string,
  options: HttpFetchOptions = {},
  redirects = 0,
): Promise<HttpResponse> {
  if (redirects > MAX_REDIRECTS) {
    return Promise.reject(new Error("Too many HTTP redirects"));
  }

  const parsed = new URL(url);
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return Promise.reject(
      new Error(`Unsupported HTTP protocol: ${parsed.protocol}`),
    );
  }

  return new Promise((resolve, reject) => {
    const request = (parsed.protocol === "https:" ? httpsRequest : httpRequest)(
      url,
      { method: options.method ?? "GET", headers: options.headers },
      (response) => {
        const status = response.statusCode ?? 0;
        if (status >= 300 && status < 400 && response.headers.location) {
          response.resume();
          const nextUrl = new URL(response.headers.location, url).toString();
          resolve(httpFetch(nextUrl, options, redirects + 1));
          return;
        }

        let body = "";
        let size = 0;
        response.setEncoding("utf8");
        response.on("data", (chunk: string) => {
          size += chunk.length;
          if (size > MAX_RESPONSE_BYTES) {
            request.destroy(new Error("HTTP response exceeds size limit"));
            return;
          }
          body += chunk;
        });
        response.on("error", reject);
        response.on("end", () => {
          resolve({
            ok: status >= 200 && status < 300,
            status,
            json: async () => JSON.parse(body),
          });
        });
      },
    );

    request.setTimeout(options.timeout ?? 30_000, () => {
      request.destroy(new Error("HTTP request timed out"));
    });
    request.on("error", reject);
    request.end(options.body);
  });
}
