import { useState, useEffect, useRef } from "react";

const LAUNCHDARKLY_DOMAINS = [
  "events.launchdarkly.com",
  // Other domains:
  //   'clientsdk.launchdarkly.com',
  //   'stream.launchdarkly.com',
  //   'app.launchdarkly.com',
  //   'sdk.launchdarkly.com'
];

const isLaunchDarklyRequest = (url) => {
  try {
    const urlObj = new URL(url);
    return LAUNCHDARKLY_DOMAINS.some((domain) =>
      urlObj.hostname.includes(domain)
    );
  } catch {
    return false;
  }
};

export const useNetworkMonitor = () => {
  const [requests, setRequests] = useState([]);
  const originalFetch = useRef(null);
  const originalXHROpen = useRef(null);
  const originalXHRSend = useRef(null);

  useEffect(() => {
    // Store original functions
    originalFetch.current = window.fetch;
    originalXHROpen.current = XMLHttpRequest.prototype.open;
    originalXHRSend.current = XMLHttpRequest.prototype.send;

    // Patch fetch
    window.fetch = async (...args) => {
      const [resource, config] = args;
      const url = typeof resource === "string" ? resource : resource.url;

      if (isLaunchDarklyRequest(url)) {
        const requestId = Date.now() + Math.random();
        const startTime = performance.now();

        // Log request
        const requestData = {
          id: requestId,
          url,
          method: config?.method || "GET",
          headers: config?.headers || {},
          body: config?.body,
          timestamp: new Date().toISOString(),
          startTime,
          type: "fetch",
        };

        setRequests((prev) => [...prev, { ...requestData, status: "pending" }]);

        try {
          const response = await originalFetch.current(...args);
          const endTime = performance.now();
          const duration = endTime - startTime;

          // Clone response to read body without consuming it
          const responseClone = response.clone();
          let responseBody;

          try {
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
              responseBody = await responseClone.json();
            } else {
              responseBody = await responseClone.text();
            }
          } catch {
            responseBody = "[Unable to read response body]";
          }

          // Update request with response data
          setRequests((prev) =>
            prev.map((req) =>
              req.id === requestId
                ? {
                    ...req,
                    status: "completed",
                    responseStatus: response.status,
                    responseHeaders: Object.fromEntries(
                      response.headers.entries()
                    ),
                    responseBody,
                    duration: Math.round(duration),
                  }
                : req
            )
          );

          return response;
        } catch (error) {
          const endTime = performance.now();
          const duration = endTime - startTime;

          // Update request with error
          setRequests((prev) =>
            prev.map((req) =>
              req.id === requestId
                ? {
                    ...req,
                    status: "error",
                    error: error.message,
                    duration: Math.round(duration),
                  }
                : req
            )
          );

          throw error;
        }
      }

      return originalFetch.current(...args);
    };

    // Patch XMLHttpRequest
    XMLHttpRequest.prototype.open = function (method, url, ...args) {
      this._url = url;
      this._method = method;

      if (isLaunchDarklyRequest(url)) {
        const requestId = Date.now() + Math.random();
        this._requestId = requestId;
        this._startTime = performance.now();

        const requestData = {
          id: requestId,
          url,
          method,
          headers: {},
          body: null,
          timestamp: new Date().toISOString(),
          startTime: this._startTime,
          type: "xhr",
        };

        setRequests((prev) => [...prev, { ...requestData, status: "pending" }]);

        // Override setRequestHeader to capture headers
        const originalSetRequestHeader = this.setRequestHeader;
        this.setRequestHeader = function (header, value) {
          setRequests((prev) =>
            prev.map((req) =>
              req.id === requestId
                ? { ...req, headers: { ...req.headers, [header]: value } }
                : req
            )
          );
          originalSetRequestHeader.call(this, header, value);
        };
      }

      return originalXHROpen.current.call(this, method, url, ...args);
    };

    XMLHttpRequest.prototype.send = function (body) {
      if (this._requestId) {
        // Update request with body
        setRequests((prev) =>
          prev.map((req) =>
            req.id === this._requestId ? { ...req, body } : req
          )
        );

        // Set up response handler
        const originalOnReadyStateChange = this.onreadystatechange;
        this.onreadystatechange = function () {
          if (this.readyState === 4) {
            const endTime = performance.now();
            const duration = endTime - this._startTime;

            let responseBody;
            try {
              const contentType = this.getResponseHeader("content-type");
              if (contentType && contentType.includes("application/json")) {
                responseBody = JSON.parse(this.responseText);
              } else {
                responseBody = this.responseText;
              }
            } catch {
              responseBody = this.responseText;
            }

            const responseHeaders = {};
            const headerString = this.getAllResponseHeaders();
            if (headerString) {
              headerString.split("\r\n").forEach((line) => {
                const [key, value] = line.split(": ");
                if (key && value) {
                  responseHeaders[key.toLowerCase()] = value;
                }
              });
            }

            setRequests((prev) =>
              prev.map((req) =>
                req.id === this._requestId
                  ? {
                      ...req,
                      status:
                        this.status >= 200 && this.status < 300
                          ? "completed"
                          : "error",
                      responseStatus: this.status,
                      responseHeaders,
                      responseBody,
                      duration: Math.round(duration),
                      ...(this.status >= 400 && {
                        error: `HTTP ${this.status}`,
                      }),
                    }
                  : req
              )
            );
          }

          if (originalOnReadyStateChange) {
            originalOnReadyStateChange.call(this);
          }
        };
      }

      return originalXHRSend.current.call(this, body);
    };

    // Cleanup function
    return () => {
      if (originalFetch.current) {
        window.fetch = originalFetch.current;
      }
      if (originalXHROpen.current) {
        XMLHttpRequest.prototype.open = originalXHROpen.current;
      }
      if (originalXHRSend.current) {
        XMLHttpRequest.prototype.send = originalXHRSend.current;
      }
    };
  }, []);

  const clearRequests = () => setRequests([]);

  return { requests, clearRequests };
};
