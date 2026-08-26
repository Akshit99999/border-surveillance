# Border Surveillance

Real-time border surveillance platform for ingesting IP camera feeds, running AI/computer-vision inference, and delivering structured alerts to a command-and-control dashboard.

## System architecture

```text
IP Cameras (RTSP/ONVIF)
        |
        v
Video ingestion -> AI/CV inference -> Event and rule layer -> Firebase
                                                        |
                                                        v
                                     Web dashboard / command and control
```

The source technology stack is documented in `IBVAP_Tech_Stack.docx`. That document is intentionally excluded from version control; the stack summary below captures the implementation decisions needed by the repository.

## Technology stack

| Layer | Technology | Purpose |
| --- | --- | --- |
| Video ingestion | Python, OpenCV, RTSP/ONVIF | Capture streams and prepare frames for inference |
| Frame queueing | Redis Streams | Decouple ingestion from inference |
| Live video relay | Go2RTC or MediaMTX | Relay RTSP streams to the dashboard over WebRTC |
| AI/CV | Python, PyTorch, YOLOv8/v9, ByteTrack/DeepSORT | Detect and track people and vehicles |
| Specialized CV | RetinaFace/MTCNN, ArcFace, EasyOCR/PaddleOCR | Face matching and ANPR |
| Inference optimization | ONNX Runtime, TensorRT, NVIDIA Triton | Serve and optimize models for central or Jetson inference |
| Backend API | Django, Django REST Framework, Django Channels | Camera configuration, orchestration, REST APIs, and live alert delivery |
| Event bus | Kafka or RabbitMQ | Move detection events between inference services and the backend |
| Data and media | Firebase Firestore, Storage, FCM, Auth, Cloud Functions | Persist alerts, media, users, notifications, and serverless triggers |
| Evidence integrity | IPFS, smart contracts, blockchain | Maintain a tamper-evident, decentralized incident ledger |
| Frontend | React/Next.js, TypeScript | Command-and-control dashboard |
| Maps and video | Leaflet or Mapbox GL, WebRTC | Sector/fence visualization and live video wall |
| Deployment | Vercel, GitHub Actions | Web application deployment and CI/CD |
| Monitoring | Prometheus, Grafana, Firebase Crashlytics/Performance | Infrastructure and dashboard health |

## Repository structure

```text
.
├── backend/
│   ├── manage.py
│   ├── config/
│   └── app/
│   │   ├── api/
│   │   │   └── routes/
│   │   ├── core/
│   │   ├── db/
│   │   │   └── repositories/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   │   ├── alerts/
│   │   │   ├── cameras/
│   │   │   ├── notifications/
│   │   │   └── rules/
│   │   └── workers/
│   └── tests/
└── frontend/
    ├── app/
    │   ├── auth/
    │   ├── dashboard/
    │   ├── cameras/
    │   ├── alerts/
    │   ├── map/
    │   └── settings/
    ├── components/
    │   ├── dashboard/
    │   ├── maps/
    │   ├── video/
    │   └── ui/
    ├── hooks/
    ├── lib/
    ├── types/
    ├── public/
    └── tests/
```

The directories are scaffolded with `.gitkeep` files so the structure is preserved until implementation files are added.

## Backend structure

The backend is a thin orchestration layer between the AI services and Firebase. It should remain stateless where possible, with Firestore as the structured event store and Cloud Storage as the media store.

```text
backend/
├── manage.py                    # Django management entry point
├── config/                      # Django project configuration
│   ├── settings.py              # Environment, apps, middleware, and Firebase settings
│   ├── urls.py                  # Root URL routing
│   ├── asgi.py                  # ASGI entry point for Channels/WebSockets
│   └── wsgi.py                  # WSGI entry point for deployment
├── app/
│   ├── apps.py                    # Django application configuration
│   ├── api/
│   │   ├── deps.py                # Shared dependencies and auth context
│   │   └── routes/
│   │       ├── alerts.py          # Alert list, acknowledgement, and status
│   │       ├── cameras.py         # Camera configuration and health
│   │       ├── detections.py      # Structured detection/event endpoints
│   │       ├── sectors.py         # Border sectors, BOPs, and virtual fences
│   │       └── watchlist.py       # Face and plate watchlist management
│   ├── core/
│   │   ├── config.py              # Environment and service configuration
│   │   ├── logging.py             # Structured application logging
│   │   └── security.py            # Firebase token validation and roles
│   ├── db/
│   │   ├── firebase.py            # Firestore, Storage, and FCM clients
│   │   └── repositories/          # Persistence access by aggregate
│   ├── models/                    # Internal domain models
│   ├── schemas/                   # API request/response schemas
│   ├── services/
│   │   ├── alerts/                # Alert creation and deduplication
│   │   ├── cameras/               # Camera registration and stream metadata
│   │   ├── notifications/         # FCM and external command-center delivery
│   │   └── rules/                 # Intrusion and suspicious-activity rules
│   └── workers/
│       ├── event_consumer.py      # Kafka/RabbitMQ detection consumer
│       └── media_processor.py     # Snapshot and clip processing
└── tests/
```

### Backend event flow

1. Ingestion services capture RTSP/ONVIF streams and publish frames or detections through Redis Streams.
2. AI inference services produce tracked objects and detection events.
3. The event consumer sends detection events to the rule engine.
4. The rule engine debounces repeated detections and creates alert-worthy events.
5. The backend persists structured alerts in `/alerts/{alertId}`, stores snapshots/clips in Firebase Storage, and sends FCM notifications when required.
6. Django REST Framework endpoints serve configuration and history; Django Channels provides live alert updates over WebSockets.

Raw per-frame bounding boxes should be batched to Cloud Storage or BigQuery rather than written directly to Firestore. Firestore should contain alert-worthy events, camera configuration, watchlists, users, and sector/BOP metadata.

## Frontend structure

The frontend uses Next.js/React with TypeScript. Firestore real-time listeners drive alert and camera updates without polling, while WebRTC embeds the low-latency live video wall.

| Directory | Responsibility |
| --- | --- |
| `frontend/app/` | Route-level pages for authentication, dashboard, cameras, alerts, map, and settings |
| `frontend/components/dashboard/` | KPI cards, alert feeds, command-center panels, and operator controls |
| `frontend/components/maps/` | BOP locations, sectors, tracked objects, and virtual-fence overlays |
| `frontend/components/video/` | WebRTC player and multi-camera video wall |
| `frontend/components/ui/` | Shared presentation components |
| `frontend/hooks/` | Reusable Firestore, WebSocket, auth, and camera hooks |
| `frontend/lib/` | Firebase client, API client, and authentication helpers |
| `frontend/types/` | Shared TypeScript domain and API types |
| `frontend/public/` | Static assets |
| `frontend/tests/` | Unit, component, and end-to-end tests |

## Firebase data model

- `alerts/{alertId}`: alert type, camera ID, timestamp, location GeoPoint, confidence, status, and media URL.
- Camera configuration, watchlist entries, users, sectors, and BOP metadata should use separate collections.
- Use GeoPoint with a geospatial helper such as GeoFirestore for radius queries.
- Use Firebase Authentication roles for Guard, Operator, Admin, and Command Center users.
- Use Cloud Functions for media post-processing and forwarding critical alerts to external command-and-control systems.

## Blockchain: immutable evidence vault

### Core use case

Firebase remains the operational data layer for live alerts and dashboard responsiveness, while blockchain acts as the immutable evidence vault. When an intrusion is recorded on-chain, the evidence reference and incident metadata become tamper-evident: any later attempt to alter a CCTV snapshot or replace an alert can be detected cryptographically.

Only the evidence hash and essential incident metadata should be committed on-chain. Images and video clips stay off-chain to avoid exposing sensitive data or paying prohibitive storage costs.

### Evidence logging flow

1. **Trigger:** the AI pipeline detects a suspicious person or vehicle crossing a virtual fence.
2. **Off-chain storage:** Django uploads the event snapshot or clip to IPFS. IPFS returns a content identifier (CID) that uniquely represents that exact evidence file.
3. **On-chain logging:** Django calls the deployed smart contract with the camera ID, timestamp, GPS coordinates, alert type, and IPFS CID.
4. **Verification:** the dashboard retrieves the blockchain incident reference and recomputes the file hash/CID for the evidence being viewed. A mismatch proves the file has been altered or replaced.

```text
AI/CV detection -> Django alert service -> IPFS evidence upload -> CID
                                             |
                                             v
                                     Smart-contract incident log
                                             |
                                             v
                                  Command dashboard verification
```

### Resilience and cybersecurity value

Border outposts are sensitive targets. If a local server is compromised, destroyed, or controlled by an insider, a traditional local database can be edited or lost. A distributed blockchain ledger preserves an independently verifiable incident record across network nodes, so high command can still verify that a breach was logged even when a local system is unavailable.

This is a genuine **Blockchain & Cybersecurity** use case for Problem Statement 187: blockchain is not used as a generic feature, but as a decentralized evidence vault that addresses insider manipulation, evidence tampering, and a single point of failure.

### 30-second pitch

> Our AI handles the surveillance, but our blockchain integration secures the evidence. Whenever a camera detects a threat, the event data and image hashes are committed to a smart contract. This ensures zero-trust security: even if a central server is hacked or an insider tries to cover their tracks, the intrusion log remains immutable, transparent, and mathematically verifiable by border security commanders.

## Deployment

- Vercel: deploy the Next.js command-and-control dashboard and web-facing application.
- Django API: expose the production API through the configured backend URL consumed by the Vercel deployment.
- Remote BOPs: run inference on Jetson Orin/Xavier edge nodes and sync alerts rather than raw video when uplink is limited.
- CI/CD: use GitHub Actions for checks, builds, and Vercel deployment integration.
- Monitoring: use Prometheus and Grafana for camera/node health.

## Recommended build order

1. Video ingestion and single-camera human/vehicle detection.
2. Firestore event pipeline and dashboard alert feed.
3. ANPR and face-detection modules.
4. Virtual fences, night-mode detection, and suspicious-activity detection.
5. Edge deployment and ONNX/TensorRT optimization.
