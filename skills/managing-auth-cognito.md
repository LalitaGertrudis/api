# Managing Authentication: AWS Cognito

**Description**: Guidelines for integrating AWS Cognito for user authentication, token verification, and session management.
**Freedom Level**: Low (Security-critical integration, adhere strictly to security standards).

## Best Practices

- **Token Verification**: Validate the JWT structure and signature implicitly via AWS-provided libraries (e.g., `aws-jwt-verify`). Do not build custom JWT decoding routines for trust decisions.
- **Security & Logging**: Never log raw access tokens, ID tokens, or Personally Identifiable Information (PII).
- **Stateless Authorization**: Rely on the JWT claims for stateless endpoint authorization where possible to reduce database latency.
- **User Syncing**: Use Post-Confirmation Cognito triggers if you need to synchronize newly registered Cognito users to the PostgreSQL database.

## Workflow: Verifying Protected Endpoints

1. Extract the `Bearer` token from the `Authorization` header.
2. Verify the token using `aws-jwt-verify`.
3. Extract `sub` (User ID) and specific IAM roles/claims.
4. Inject the verified user identity into the request context for downstream handlers.
