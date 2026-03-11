# Managing Observability: Prometheus, Grafana, AlertManager

**Description**: Implementation patterns for instrumentation, system health monitoring, metrics exposure, and alerting.
**Freedom Level**: Medium (Standardized metric types are strict, what you measure is flexible).

## Best Practices

- **Metrics Endpoint**: Always expose Prometheus metrics via an unauthenticated, internal-facing `/metrics` endpoint.
- **Standard Golden Signals**: Measure RED (Rate, Errors, Duration) for all HTTP endpoints.
- **Labels Constraint**: Keep metric label cardinality low. Never use unbounded unique values (like User IDs or raw URLs) as label values. Use standardized labels: `method`, `route` (e.g., `/users/:id`, not `/users/123`), and `status_code`.
- **Alerting thresholds**: Write alerts geared toward user impact (e.g., 5xx rate > 1%, p99 latency > 2s).

## Workflow: Adding a Custom Metric

1. Define a global metric registry instance.
2. Determine the type: `Counter` (total events), `Histogram` (latency/sizes), or `Gauge` (current state/memory).
3. Register the metric and update it within the relevant handler/service.
4. Update the Grafana dashboard JSON models (if required in codebase) to visualize the new metric.
