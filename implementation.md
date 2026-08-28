# Implementation Plan

This document tracks the practical implementation of the Border Surveillance platform and the integration of reusable modules from `C:\Users\Lenovo\Downloads\IBVAP-modules\IBVAP-modules`.

## Integration objective

The existing repository provides the Django backend and Next.js frontend structure. The external module bundle may contain frontend assets, AI models, and backend components. This integration will add only backend-relevant code and configuration that fits the project architecture, while keeping the existing documentation and scaffolding intact.

## Target backend architecture

```text
Existing CCTV/NVR or approved local surveillance server
        -> video ingestion and AI inference
        -> durable local outbox during network loss
        -> Django API and alert/rule services
        -> Firebase, Pinata, and blockchain audit records
        -> command-and-control dashboard
```

## Integration rules

- Preserve existing files and do not overwrite project work without review.
- Keep frontend-specific code out of `backend/`.
- Treat model weights, generated media, credentials, and local runtime data as non-versioned assets.
- Place reusable Python services, scripts, and configuration under the Django backend structure.
- Record the source-to-destination mapping and any required adaptation after the source inventory is complete.

## Source inventory and integration mapping

| Source item | Decision | Destination or handling |
| --- | --- | --- |
| `backend/` and `frontend/` | Not copied | They contain the same placeholder scaffold already present in this repository. |
| `anpr-module` Python implementation | Integrated | `backend/app/services/inference/anpr/` as a lazy-loaded Django-worker service. |
| `person-detection-module` script | Reworked | `backend/app/services/inference/person/` removes hard-coded input video and GUI behaviour. |
| `face-detection-module` notebook | Reworked | `backend/app/services/inference/face/` provides detection only; recognition remains a separately authorized capability. |
| Model weights, sample videos, output media, and sample face images | Not copied | Runtime assets stay in ignored local storage and must be supplied through approved deployment channels. |

## Integrated backend modules

```text
backend/app/services/inference/
├── anpr/                 # Indian plate detection and OCR
├── person/               # Person detection and DeepSORT tracking
├── face/                 # Face detection boundary
├── contracts.py          # Shared normalized detection objects
└── README.md             # Runtime paths, privacy, and attribution
```

The module dependencies are listed in `backend/requirements-ai.txt`. AI workers must load weights from an ignored local runtime path such as `backend/.localdata/models/`; no model weights or demo media are tracked by Git.

## Status

Backend module integration is complete. Runtime model placement, Django worker wiring, and model validation are the next implementation steps.
