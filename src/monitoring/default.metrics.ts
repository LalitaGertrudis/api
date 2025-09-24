import { collectDefaultMetrics, register } from "prom-client";

collectDefaultMetrics({
    prefix: "api_",
    register,
    gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5],
    eventLoopMonitoringPrecision: 10,
    labels: {
        app: "api",
        version: process.env.npm_package_version || "1.0.0",
        environment: process.env.NODE_ENV || "development",
    },
});

export { register };
