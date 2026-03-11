import { Counter, Histogram, Gauge, register } from "prom-client";

/**
 * @category HTTP Metrics
 * Metrics to track request duration, count, and active requests.
 */
export const httpRequestDuration = new Histogram({
    name: "http_request_duration_seconds",
    help: "Duration of HTTP requests in seconds",
    labelNames: ["method", "route", "status"],
    buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
    registers: [register],
});

export const httpRequestTotal = new Counter({
    name: "http_requests_total",
    help: "Total number of HTTP requests",
    labelNames: ["method", "route", "status"],
    registers: [register],
});

export const requestsInFlight = new Gauge({
    name: "api_requests_in_flight",
    help: "Number of requests currently being processed",
    registers: [register],
});

/**
 * @category Error Metrics
 */
export const errorTotal = new Counter({
    name: "api_errors_total",
    help: "Total number of errors",
    labelNames: ["type", "route"],
    registers: [register],
});
