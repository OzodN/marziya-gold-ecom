# Implementation Plan: TASK-0032 — Production Security Hardening, Zero-Maintenance Seeding and Handover Documentation

## 1. Goal
Finalize the turnkey "Zero-Maintenance" deployment foundation and operational handover documentation for `marziya-gold_ecom`.

## 2. Steps
1. **Production Configuration Hardening:**
   - Create `apps/backend/src/main/resources/application-prod.yml` with:
     - HikariCP pool optimization (`maximum-pool-size: 10`, `minimum-idle: 2`, `idle-timeout: 300000`, `max-lifetime: 1800000`, `connection-timeout: 20000`, `leak-detection-threshold: 30000`).
     - Flyway auto-migrate on boot (`enabled: true`, `validate-on-migrate: true`).
     - Production logging (minimal INFO, suppressed noise).
     - CORS settings for production custom domains (`https://marziyagold.uz`, `https://admin.marziyagold.uz`, `https://www.marziyagold.uz`).
     - Spring Actuator safe configuration (`health`, `info`) with database liveness probe.
     - Rate-limiting configuration for public inquiry submissions.
   - Update `apps/backend/src/main/resources/application.yml` with fallback profile default and clean structure.

2. **Standalone Database Seeding & Reset Scripts:**
   - Create `database/seed-production.sql` containing idempotent reference records (categories, characteristic keys, stone types, initial sample jewellery with Cloudflare R2 links, and initial default admin seed).
   - Ensure clear instructions on how the database seeds automatically via Flyway or can be reseeded on a clean PostgreSQL instance.

3. **Zero-Maintenance Turnkey Handover Documentation:**
   - Create root `HANDOVER.md` — an executive, step-by-step master handbook for non-technical stakeholders and developers:
     - Cloudflare account setup: DNS records, SSL/TLS Full (Strict), WAF rules, R2 Bucket (`marziya-media`) creation and public bucket domain / CORS rules.
     - Railway PaaS setup: GitHub repo connection, PostgreSQL service, Backend service, Frontend service, environment variables matrix.
     - First administrator login: default credentials, secure password rotation via `/admin/settings`, JWT cookie security.
     - Backup & Disaster Recovery: Railway automated daily snapshots, zero-maintenance guarantees ($0 egress, auto-healing containers, automatic SSL renewal).
   - Create `docs/operations/zero-maintenance-guide.md` with in-depth operational procedures, emergency troubleshooting checklist, and cost analysis (~$6-18/month total infrastructure cost).

4. **Verification & Testing:**
   - Run backend test suite (`mvn test`) in `apps/backend`.
   - Run frontend test suite (`npm test`) in `apps/frontend`.
   - Verify configuration syntax and schema.

5. **Handoff & Merge:**
   - Write `.ai/work/tasks/TASK-0032/handoff.md`.
   - Commit changes via Conventional Commits.
   - Merge `feat/TASK-0032-production-handover` into `main`.
   - Remove worktree.
   - Mark `TASK-0032` as `done` in `.ai/work/registry.yaml`.
