# Security and Compliance Checklist

- Hot wallet key rotation every 30 days; store in HSM/secret manager
- KYC thresholds: block withdraw > $100 without `verified`; AML checks for large deposits
- Rate limiting: 60 req/min per IP; stricter for withdraw endpoints
- JWT expiry: 15m; refresh token rotation
- Wallet-signature verification for high-value actions
- Audit trail: store all balance changes and admin actions in `transactions_audit`
- Logging: redact PII; ship to centralized log store
- Monitoring: expose Prometheus metrics and alert on errors and lag
- Backups: nightly Postgres backups; test restore monthly
