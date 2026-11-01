# Audityzer PRO

AI-assisted Web3 security and compliance audit platform for smart contracts, DeFi protocols, evidence verification, and audit-ready reporting.

Audityzer PRO is a product-oriented prototype for AI-powered security workflows. It combines smart contract scanning, compliance-ready reporting, risk visibility, post-quantum readiness tracking, and AI-assisted project tooling in a single dashboard experience.

## Product positioning

AuditorSEC is the parent platform and R&D initiative. Audityzer is the security-testing engine and product layer that turns research into actionable, audit-ready workflows.

This repository focuses on the product experience and workflow layer for:
- smart contract auditing and security review
- evidence-oriented findings and remediation tracking
- AI-assisted report generation
- DeFi / Web3 risk monitoring
- compliance and digital trust workflows
- PQC readiness evaluation

## Core capabilities

- Contract scan workflow with AI-assisted analysis
- Vulnerability inventory and severity classification
- Comparison of historical scan results
- PQC readiness dashboard and crypto asset inventory
- Project management integrations for remediation workflows
- AI PRD generation for product and security initiatives
- Creator Studio for multi-modal AI-assisted workflows
- Dashboard for executive visibility and operational reporting

## Repository structure

- `App.tsx` — main app shell and navigation
- `components/` — dashboard, scans, integrations, simulation, PQC readiness, settings, PRD generator, and Creator Studio tabs
- `services/` — Gemini AI integration, integrations, and export logic
- `types.ts` — shared domain models for scans, vulnerabilities, integrations, and app state

## Current status

This repository is currently best described as a demo-ready product prototype:
- strong product UX and workflow direction
- usable AI-driven workflow demonstrations
- high product storytelling value
- not yet a production SaaS backend with secure auth, persistence, and scalable job processing

## Local development

### Prerequisites
- Node.js

### Install

```bash
npm install
```

### Environment

Create a `.env.local` file with your Gemini API key:

```bash
GEMINI_API_KEY=your_key_here
```

### Run locally

```bash
npm run dev
```

## Recommended next steps

1. Move AI calls behind a server-side API proxy
2. Add database persistence for scans, findings, evidence, and audit logs
3. Add auth and RBAC for multi-user / multi-tenant usage
4. Add background job processing for AI scan execution
5. Add secure deployment pipeline and CI/CD
6. Introduce an evidence registry model for audit-grade reporting

## Security note

This repo is intended as a product prototype and demo environment. It should not be treated as a production-grade security platform until backend security, authentication, persistent storage, and deployment hardening are implemented.

## Website

- https://audityzer.com

## Related initiative

- https://auditorsec.com
- https://github.com/AuditorSEC-Initiative/auditorsec-initiative-eu/

## License

See repository configuration for licensing details.
