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

See [hardware-and-deployment.md](hardware-and-deployment.md) for the local, cloud, and hybrid deployment recommendation, hardware profiles, offline behavior, and data placement plan.

See [blockchain-setup.md](blockchain-setup.md) for the step-by-step Anvil/Sepolia deployment, Django environment configuration, synthetic verification test, and production security checklist.

The Live Cameras page includes an explicit **Enable Local Camera** control for testing a webcam in the browser. The video preview stays in the browser, while compressed sample frames are sent to Django's local AI endpoint and returned as detection metadata. Real CCTV/RTSP sources still require a configured WebRTC/HLS relay and a Django camera record.

The Next.js command center is integrated under `frontend/`. It hydrates from Django only. When the API is unavailable, the UI shows an explicit disconnected/empty state rather than inventing alerts, cameras, guards, or evidence.

The frontend and backend use the environment contract in `backend/.env.example` and `frontend/.env.example`. Firebase Admin credentials and blockchain signer values stay on the Django server; only the public API base URL belongs in the frontend environment.

## Technology stack

| Layer | Technology | Purpose |
| --- | --- | --- |
| Video ingestion | Python, OpenCV, RTSP/ONVIF | Capture streams and prepare frames for inference |
| Frame queueing | Redis Streams | Decouple ingestion from inference |
| Live video relay | Go2RTC or MediaMTX | Relay RTSP streams to the dashboard over WebRTC |
| AI/CV | Python, PyTorch, YOLOv8/v9, ByteTrack/DeepSORT | Detect and track people and vehicles |
| Specialized CV | RetinaFace/MTCNN, ArcFace, EasyOCR/PaddleOCR | Face matching and ANPR |
| Inference optimization | ONNX Runtime, TensorRT, NVIDIA Triton | Serve and optimize models on approved local or central servers |
| Backend API | Django, Django REST Framework, Django Channels | Camera configuration, orchestration, REST APIs, and live alert delivery |
| Event bus | Kafka or RabbitMQ | Move detection events between inference services and the backend |
| Data and media | Firebase Firestore, Storage, FCM, Auth, Cloud Functions | Persist alerts, media, users, notifications, and serverless triggers |
| Evidence accountability | Smart contracts, blockchain | Maintain tamper-evident evidence custody and AI-model provenance |
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

## Blockchain-backed accountability

Blockchain is used only for records that must remain independently verifiable after an incident. Firebase remains the operational store for alerts, media, users, and dashboard data; the blockchain records proof of evidence handling and the AI model that produced a high-severity detection.

### Evidence chain of custody

When an alert creates or changes an evidence item, Django hashes the media file and appends a custody event to the smart contract. Each event records the alert/evidence reference, action, timestamp, user role, and evidence hash. The supported actions are `created`, `viewed`, `downloaded`, `assigned`, and `resolved`.

This gives commanders an auditable sequence of who handled the evidence and when. Altering a Firebase alert, replacing a stored image, or removing a local log cannot rewrite the on-chain custody history; a recalculated file hash will no longer match the recorded evidence hash.

### AI model provenance

For every high-severity alert, Django also records the inference model identifier, model version, model artifact hash, confidence score, and decision threshold. This links the incident to the exact approved model build that generated it, so reviewers can verify the origin of a detection and distinguish an authorised deployment from an untracked or altered model.

```text
AI inference -> high-severity alert -> Django evidence service
                                      |               |
                                      |               +-> record model provenance on-chain
                                      v
                          store media + alert in Firebase
                                      |
                                      +-> append custody actions on-chain
```

Media files, personally identifiable data, and full user identities remain off-chain. Firebase stores the protected operational data; the smart contract stores only hashes, action metadata, role information, model provenance, and transaction IDs. The Firebase alert links to its blockchain transaction IDs so the dashboard can show both the live incident and its verification trail.

## Deployment

- Vercel: deploy the Next.js command-and-control dashboard and web-facing application.
- Django API: expose the production API through the configured backend URL consumed by the Vercel deployment.
- Remote BOPs: use the existing CCTV/NVR for recording and an approved local border-post server for AI inference where offline detection is required; otherwise synchronize recorded footage when uplink is restored.
- CI/CD: use GitHub Actions for checks, builds, and Vercel deployment integration.
- Monitoring: use Prometheus and Grafana for camera/node health.

## Recommended build order

1. Video ingestion and single-camera human/vehicle detection.
2. Firestore event pipeline and dashboard alert feed.
3. ANPR and face-detection modules.
4. Virtual fences, night-mode detection, and suspicious-activity detection.
5. Edge deployment and ONNX/TensorRT optimization.

## Run the integrated command center locally

```powershell
python -m venv .venv
.\.venv\Scripts\pip install -r backend\requirements-web.txt
.\.venv\Scripts\pip install -r backend\requirements-services.txt
\.venv\Scripts\python backend\manage.py runserver 127.0.0.1:8000
```

In a second terminal:

```powershell
npm ci --prefix frontend
npm run dev --prefix frontend
```

The frontend reads `frontend/.env.example`. For blockchain verification and anchoring, copy the backend placeholders from `backend/.env.example` into the Django deployment secret manager. The wallet private key is never sent to Vercel or the browser.

### Backend API surface

- `GET /api/bootstrap` — dashboard data, system state, and blockchain status.
- `POST /api/alerts/{id}/action` — acknowledge or escalate an alert.
- `POST /api/alerts/{id}/anchor` — backend-signed EvidenceRegistry transaction.
- `GET /api/alerts/{id}/verification` — compare the evidence digest with the contract.
- `PATCH /api/cameras/{id}`, `PATCH /api/guards/{id}`, and `PATCH /api/shifts/{id}` — persist console configuration changes.
- `POST /api/sync` — idempotently flush alerts and activity captured during an outage.
- `POST /api/inference/frame` — run the configured local YOLO model on one JPEG frame and return detection boxes.
