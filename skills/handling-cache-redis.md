# Handling Caching & Queues: Redis

**Description**: Context and patterns for interacting with Redis for caching strategies, session state, or background job queues.
**Freedom Level**: Medium (Follow key patterns, but adapt payload structures as needed).

## Best Practices

- **Namespacing**: Prefix all Redis keys using standard namespaces to prevent collisions. Format: `<entity>:<action>:<id>` (e.g., `user:session:123`, `rate-limit:login:ip-address`).
- **TTL Mandatory**: Always specify an expiration (TTL) for cached keys to prevent unbounded memory growth.
- **Data Serialization**: Standardize on `JSON.stringify()` and `JSON.parse()` for storing complex objects.
- **Queues**: If using Redis for streams/queues, guarantee graceful degradation if Redis is temporarily unreachable.

## Workflow: Implementing a Cached Query

1. Define the cache key pattern and expected TTL for the data.
2. Check Redis for the key before querying PostgreSQL.
3. Upon Cache Miss: Query the DB, compute the result, serialize to JSON, and write to Redis with `SETEX`.
4. Implement a cache invalidation strategy for mutable data (e.g., clearing `user:profile:123` upon profile update).
