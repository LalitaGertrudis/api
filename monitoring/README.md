# API Monitoring Stack

This directory contains the monitoring infrastructure for the API project using Prometheus, AlertManager, and Grafana.

## Overview

The monitoring stack consists of:

- **Prometheus**: Metrics collection and storage
- **AlertManager**: Alert routing and notification management
- **Grafana**: Metrics visualization and dashboards
- **Redis Exporter**: Redis metrics collection

## Quick Start

### Starting the Monitoring Stack

```bash
# Start all monitoring services
bun monitoring:start

# Or start the entire stack including API and Redis
docker-compose up -d
```

### Accessing Services

- **Prometheus**: http://localhost:9090
- **AlertManager**: http://localhost:9093
- **Grafana**: http://localhost:3001 (default credentials: admin/admin)

### Stopping the Monitoring Stack

```bash
# Stop monitoring services only
bun monitoring:stop

# Stop everything
docker-compose down
```

## Available Metrics

### Default Metrics (from prom-client)

- Process metrics (CPU, memory, file descriptors)
- Node.js runtime metrics (heap, event loop, garbage collection)
- HTTP server metrics (request count, duration)

### Custom API Metrics

#### HTTP Request Metrics

- `http_request_duration_seconds`: Duration of HTTP requests in seconds (histogram)
- `http_requests_total`: Total number of HTTP requests (counter)
- `api_requests_in_flight`: Number of requests currently being processed (gauge)

#### Error Metrics

- `api_errors_total`: Total number of errors by type and route (counter)

#### Business Metrics

- `api_active_connections`: Number of active connections (gauge)
- `api_rate_limit_hits_total`: Total number of rate limit hits by route (counter)

### Redis Metrics (via Redis Exporter)

- Redis connection status
- Memory usage
- Commands processed
- Key statistics
- Replication status

## Alert Rules

The following alerts are configured:

### Critical Alerts

- **APIDown**: API is unreachable for more than 1 minute
- **HighErrorRate**: Error rate exceeds 5% for 5 minutes
- **RedisDown**: Redis is unreachable for more than 1 minute

### Warning Alerts

- **HighResponseTime**: 95th percentile response time > 1 second for 5 minutes
- **HighMemoryUsage**: Memory usage exceeds 90% for 5 minutes
- **HighCPUUsage**: CPU usage exceeds 80% for 5 minutes

## Configuration

### Adding Custom Metrics

1. Add metric definitions in `src/monitoring/custom.metrics.ts`
2. Use metrics in your application code:

```typescript
import { httpRequestTotal, errorTotal } from "@/monitoring/custom.metrics";

// Increment counter
httpRequestTotal.inc({ method: "GET", route: "/api/users", status: "200" });

// Track errors
errorTotal.inc({ type: "database_error", route: "/api/users" });
```

### Adding New Alerts

1. Edit `monitoring/alerting-rules/api-alerts.yml`
2. Add your alert rule following the Prometheus alerting rule format
3. Restart Prometheus: `docker-compose restart prometheus`

Example alert:

```yaml
- alert: HighDatabaseLatency
  expr: database_query_duration_seconds > 0.5
  for: 5m
  labels:
      severity: warning
      service: database
  annotations:
      summary: "Database queries are slow"
      description: "Database query latency is above 500ms"
```

### Configuring Alert Notifications

Edit `monitoring/alertmanager/alertmanager.yml` to configure notification channels:

```yaml
receivers:
    - name: "team-notifications"
      email_configs:
          - to: "team@example.com"
      slack_configs:
          - api_url: "YOUR_SLACK_WEBHOOK_URL"
            channel: "#alerts"
```

## Grafana Dashboards

### Creating Dashboards

1. Access Grafana at http://localhost:3001
2. Login with admin/admin (change password on first login)
3. Create a new dashboard or import existing ones
4. Save dashboards to persist them

### Recommended Dashboard Panels

1. **API Health Overview**
    - Request rate
    - Error rate
    - Response time (p50, p95, p99)
    - Active connections

2. **Resource Usage**
    - CPU usage
    - Memory usage
    - Heap size
    - Event loop lag

3. **Redis Metrics**
    - Connection status
    - Commands per second
    - Memory usage
    - Hit/miss ratio

## Best Practices

### Metric Naming

- Use consistent prefixes (e.g., `api_` for custom metrics)
- Follow Prometheus naming conventions
- Use descriptive names that indicate the unit (e.g., `_seconds`, `_bytes`)

### Label Usage

- Keep cardinality low (avoid unique IDs as labels)
- Use consistent label names across metrics
- Common labels: `method`, `route`, `status`, `error_type`

### Alert Design

- Set appropriate thresholds based on SLOs
- Use `for` duration to reduce false positives
- Include actionable information in descriptions
- Test alerts in staging before production

### Performance Considerations

- Limit the number of metrics and labels
- Use histograms sparingly (they're expensive)
- Configure appropriate retention periods
- Monitor Prometheus resource usage

## Troubleshooting

### Prometheus Not Scraping Metrics

1. Check targets at http://localhost:9090/targets
2. Verify network connectivity between containers
3. Check API `/metrics` endpoint is accessible
4. Review Prometheus logs: `docker-compose logs prometheus`

### Alerts Not Firing

1. Check alert rules syntax in Prometheus UI
2. Verify AlertManager is receiving alerts
3. Check AlertManager configuration
4. Review logs: `docker-compose logs alertmanager`

### High Memory Usage

1. Reduce metric cardinality
2. Decrease retention period
3. Optimize query patterns
4. Consider using recording rules

## Maintenance

### Regular Tasks

- Review and tune alert thresholds monthly
- Archive old Grafana dashboards
- Clean up unused metrics
- Update monitoring stack versions

### Backup

- Prometheus data is stored in `prometheus_data` volume
- Grafana dashboards are stored in `grafana_data` volume
- Use Docker volume backup tools or export dashboards as JSON

## Additional Resources

- [Prometheus Documentation](https://prometheus.io/docs/)
- [AlertManager Documentation](https://prometheus.io/docs/alerting/latest/alertmanager/)
- [Grafana Documentation](https://grafana.com/docs/)
- [PromQL Tutorial](https://prometheus.io/docs/prometheus/latest/querying/basics/)
