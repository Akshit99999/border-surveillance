"""Small, realistic seed dataset used when Firebase is not configured yet."""

from copy import deepcopy


def _attendance() -> list[dict[str, object]]:
    return [
        {"date": "2026-08-24", "status": "present", "hours": 8},
        {"date": "2026-08-25", "status": "late", "hours": 7.5},
        {"date": "2026-08-26", "status": "present", "hours": 8},
        {"date": "2026-08-27", "status": "present", "hours": 8},
    ]


DEMO_STATE = {
    "currentUser": {
        "name": "Sub-Inspector Rajesh Sharma",
        "rank": "Sub-Inspector",
        "badgeId": "SSB-SI-4921",
        "role": "Sector Command Officer",
    },
    "guards": [
        {
            "id": "GRD-01", "name": "Sub-Inspector Rajesh Sharma", "rank": "Sub-Inspector",
            "badgeId": "SSB-SI-4921", "photoUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300",
            "phone": "+91 98712 34001", "emergencyContact": {"name": "Sunita Sharma", "phone": "+91 98712 34002", "relation": "Spouse"},
            "callSign": "ALPHA-COMMAND-1", "certifications": ["Tactical Incident Command Level 3", "Night Vision Equipment - Certified"],
            "bloodGroup": "O+", "status": "on_post", "currentPostId": "POST-A1-MAIN", "currentSector": "Sector Alpha-1",
            "shiftStart": "2026-08-27T06:00:00+05:30", "shiftEnd": "2026-08-27T14:00:00+05:30",
            "assignedWeapon": "INSAS 5.56mm", "radioFrequency": "CH-01 (142.850 MHz)", "attendanceHistory": _attendance(),
        },
        {
            "id": "GRD-02", "name": "Head Constable Vikram Singh", "rank": "Head Constable",
            "badgeId": "SSB-HC-8832", "photoUrl": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300",
            "phone": "+91 98712 34003", "emergencyContact": {"name": "Harjeet Kaur", "phone": "+91 98712 34004", "relation": "Spouse"},
            "callSign": "ALPHA-2-NINER", "certifications": ["Thermal Imaging", "First Responder"],
            "bloodGroup": "B+", "status": "patrolling", "currentPostId": "POST-A2-RIVER", "currentSector": "Sector Alpha-2",
            "shiftStart": "2026-08-27T06:00:00+05:30", "shiftEnd": "2026-08-27T14:00:00+05:30",
            "assignedWeapon": "INSAS 5.56mm", "radioFrequency": "CH-02 (142.900 MHz)", "attendanceHistory": _attendance(),
        },
        {
            "id": "GRD-03", "name": "Constable Amit Gurung", "rank": "Constable",
            "badgeId": "SSB-C-7711", "photoUrl": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300",
            "phone": "+91 98712 34005", "emergencyContact": {"name": "Maya Gurung", "phone": "+91 98712 34006", "relation": "Parent"},
            "callSign": "ALPHA-3-BRAVO", "certifications": ["Forest Patrol", "Night Navigation"],
            "bloodGroup": "A+", "status": "break", "currentPostId": "POST-A3-RIDGE", "currentSector": "Sector Alpha-3",
            "shiftStart": "2026-08-27T08:00:00+05:30", "shiftEnd": "2026-08-27T16:00:00+05:30",
            "assignedWeapon": "INSAS 5.56mm", "radioFrequency": "CH-03 (142.950 MHz)", "attendanceHistory": _attendance(),
        },
        {
            "id": "GRD-04", "name": "Head Constable Ramesh Thapa", "rank": "Head Constable",
            "badgeId": "SSB-HC-6640", "photoUrl": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300",
            "phone": "+91 98712 34007", "emergencyContact": {"name": "Laxmi Thapa", "phone": "+91 98712 34008", "relation": "Spouse"},
            "callSign": "ALPHA-4-UNREACHABLE", "certifications": ["Gully Operations"],
            "bloodGroup": "AB+", "status": "unreachable", "currentPostId": "POST-A4-RIDGE", "currentSector": "Sector Alpha-4",
            "shiftStart": "2026-08-27T06:00:00+05:30", "shiftEnd": "2026-08-27T14:00:00+05:30",
            "assignedWeapon": "INSAS 5.56mm", "radioFrequency": "CH-04 (143.000 MHz)", "attendanceHistory": _attendance(),
        },
        {
            "id": "GRD-05", "name": "Sub-Inspector Priya Rawat", "rank": "Sub-Inspector",
            "badgeId": "SSB-SI-5920", "photoUrl": "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=300",
            "phone": "+91 98712 34009", "emergencyContact": {"name": "Anil Rawat", "phone": "+91 98712 34010", "relation": "Sibling"},
            "callSign": "ALPHA-5-COMMAND", "certifications": ["Incident Command", "ANPR Operations"],
            "bloodGroup": "O-", "status": "off_duty", "currentPostId": None, "currentSector": None,
            "shiftStart": "2026-08-27T14:00:00+05:30", "shiftEnd": "2026-08-27T22:00:00+05:30",
            "assignedWeapon": "INSAS 5.56mm", "radioFrequency": "CH-05 (143.050 MHz)", "attendanceHistory": _attendance(),
        },
    ],
    "shifts": [
        {"id": "SHF-001", "guardId": "GRD-01", "guardName": "Sub-Inspector Rajesh Sharma", "sector": "Sector Alpha-1", "postId": "POST-A1-MAIN", "start": "2026-08-27T06:00:00+05:30", "end": "2026-08-27T14:00:00+05:30", "day": "Thu", "shiftName": "Morning (06:00-14:00)"},
        {"id": "SHF-002", "guardId": "GRD-02", "guardName": "Head Constable Vikram Singh", "sector": "Sector Alpha-2", "postId": "POST-A2-RIVER", "start": "2026-08-27T06:00:00+05:30", "end": "2026-08-27T14:00:00+05:30", "day": "Thu", "shiftName": "Morning (06:00-14:00)"},
        {"id": "SHF-003", "guardId": "GRD-03", "guardName": "Constable Amit Gurung", "sector": "Sector Alpha-3", "postId": "POST-A3-RIDGE", "start": "2026-08-27T08:00:00+05:30", "end": "2026-08-27T16:00:00+05:30", "day": "Thu", "shiftName": "Morning (06:00-14:00)"},
        {"id": "SHF-004", "guardId": "GRD-05", "guardName": "Sub-Inspector Priya Rawat", "sector": "Sector Alpha-5", "postId": "POST-A5-BUNKER", "start": "2026-08-27T14:00:00+05:30", "end": "2026-08-27T22:00:00+05:30", "day": "Thu", "shiftName": "Evening (14:00-22:00)"},
    ],
    "alerts": [
        {"id": "ALT-2026-901", "level": "critical", "timestamp": "2026-08-27T11:42:15+05:30", "sourceCameraId": "CAM-A02-WEST", "sourceCameraName": "Sector Alpha-2 West Culvert PTZ", "eventType": "Perimeter Infiltration Breach", "confidence": 96.8, "coordinates": {"lat": 31.632, "lng": 74.882}, "objectClass": "Person", "evidenceUrl": "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=600", "status": "open", "acknowledgedBy": None, "sector": "Sector Alpha-2", "notes": "Thermal optics flagged 2 individuals attempting breach at the zero-line fence barrier."},
        {"id": "ALT-2026-902", "level": "critical", "timestamp": "2026-08-27T10:15:30+05:30", "sourceCameraId": "CAM-A01-NORTH", "sourceCameraName": "Sector Alpha-1 North Perimeter PTZ-01", "eventType": "Weapon Profile Detected (Assault Rifle)", "confidence": 94.2, "coordinates": {"lat": 31.6234, "lng": 74.8712}, "objectClass": "Weapon", "evidenceUrl": "https://images.unsplash.com/photo-1595590424283-b8f17842773f?w=600", "status": "open", "acknowledgedBy": None, "sector": "Sector Alpha-1", "notes": "AI classification detected a firearm contour in the restricted buffer zone."},
        {"id": "ALT-2026-903", "level": "high", "timestamp": "2026-08-27T09:30:10+05:30", "sourceCameraId": "CAM-A05-HIGHWAY", "sourceCameraName": "Sector Alpha-5 Highway ANPR Intercept", "eventType": "ANPR Blacklist: Modified 4x4 SUV (PB-02-AK-9921)", "confidence": 99.1, "coordinates": {"lat": 31.671, "lng": 74.926}, "objectClass": "Vehicle", "evidenceUrl": "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600", "status": "acknowledged", "acknowledgedBy": "Sub-Inspector Priya Rawat", "sector": "Sector Alpha-5", "notes": "Vehicle matched a smuggling watch database record."},
        {"id": "ALT-2026-904", "level": "critical", "timestamp": "2026-08-27T08:50:00+05:30", "sourceCameraId": "CAM-A02-WEST", "sourceCameraName": "Sector Alpha-2 West Culvert PTZ", "eventType": "POI Facial Match: Tariq Shadow Masood (94.6%)", "confidence": 94.6, "coordinates": {"lat": 31.632, "lng": 74.882}, "objectClass": "Person", "evidenceUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600", "status": "open", "acknowledgedBy": None, "sector": "Sector Alpha-2", "notes": "High-threat watchlist match near Riverine Crossing."},
        {"id": "ALT-2026-905", "level": "high", "timestamp": "2026-08-27T07:20:10+05:30", "sourceCameraId": "CAM-A06-TOWER", "sourceCameraName": "Sector Alpha-6 Watchtower Panoramic", "eventType": "Unauthorized Micro-UAV Drone Incursion", "confidence": 91.5, "coordinates": {"lat": 31.688, "lng": 74.942}, "objectClass": "Drone", "evidenceUrl": "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=600", "status": "escalated", "acknowledgedBy": "Sub-Inspector Rajesh Sharma", "sector": "Sector Alpha-6", "notes": "Rogue quadcopter moving south toward the wetland storage area."},
        {"id": "ALT-2026-906", "level": "medium", "timestamp": "2026-08-26T23:45:11+05:30", "sourceCameraId": "CAM-A01-GATE", "sourceCameraName": "Alpha-1 Gate 2 Tactical Optical", "eventType": "ANPR Suspicious: Unregistered Van (HR-26-EE-1092)", "confidence": 89.0, "coordinates": {"lat": 31.6248, "lng": 74.8735}, "objectClass": "Vehicle", "evidenceUrl": "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600", "status": "acknowledged", "acknowledgedBy": "Head Constable Vikram Singh", "sector": "Sector Alpha-1", "notes": "Light commercial van with an obscured plate attempted to pass without manifest verification."},
    ],
    "cameras": [
        {"id": "CAM-A01-NORTH", "name": "Sector Alpha-1 North Perimeter (PTZ-01)", "sector": "Sector Alpha-1", "rtspUrl": "rtsp://10.24.1.101:554/live/stream1", "type": "ptz", "aiActive": True, "personDetection": True, "vehicleDetection": True, "weaponDetection": True, "confidenceThreshold": 80, "minObjectSizePx": 28, "zonePolygon": [{"x": 15, "y": 25}, {"x": 85, "y": 25}, {"x": 92, "y": 88}, {"x": 8, "y": 88}], "triggerAction": "QRF Dispatch", "dwellTimeSeconds": 5, "status": "online", "fps": 30, "resolution": "4K (3840x2160)", "fovAngle": 95, "coordinates": {"lat": 31.6234, "lng": 74.8712}, "pan": 45, "tilt": -12, "zoom": 2.4},
        {"id": "CAM-A01-GATE", "name": "Alpha-1 Gate 2 Tactical Optical", "sector": "Sector Alpha-1", "rtspUrl": "rtsp://10.24.1.103:554/live/stream1", "type": "fixed", "aiActive": True, "personDetection": True, "vehicleDetection": True, "weaponDetection": True, "confidenceThreshold": 85, "minObjectSizePx": 32, "zonePolygon": [{"x": 20, "y": 30}, {"x": 80, "y": 30}, {"x": 80, "y": 90}, {"x": 20, "y": 90}], "triggerAction": "Guard Ping", "dwellTimeSeconds": 4, "status": "online", "fps": 30, "resolution": "2K (2560x1440)", "fovAngle": 70, "coordinates": {"lat": 31.6248, "lng": 74.8735}},
        {"id": "CAM-A02-WEST", "name": "Sector Alpha-2 West Culvert PTZ", "sector": "Sector Alpha-2", "rtspUrl": "rtsp://10.24.2.101:554/live/stream1", "type": "ptz", "aiActive": True, "personDetection": True, "vehicleDetection": False, "weaponDetection": True, "confidenceThreshold": 80, "minObjectSizePx": 25, "zonePolygon": [{"x": 10, "y": 15}, {"x": 90, "y": 15}, {"x": 95, "y": 85}, {"x": 5, "y": 85}], "triggerAction": "Floodlight Trigger", "dwellTimeSeconds": 2, "status": "online", "fps": 30, "resolution": "4K (3840x2160)", "fovAngle": 90, "coordinates": {"lat": 31.632, "lng": 74.882}, "pan": 120, "tilt": -5, "zoom": 1.8},
        {"id": "CAM-A03-OUTPOST", "name": "Sector Alpha-3 High Ridge Observation", "sector": "Sector Alpha-3", "rtspUrl": "rtsp://10.24.3.101:554/live/stream1", "type": "fixed", "aiActive": True, "personDetection": True, "vehicleDetection": True, "weaponDetection": True, "confidenceThreshold": 78, "minObjectSizePx": 30, "zonePolygon": [{"x": 25, "y": 20}, {"x": 75, "y": 20}, {"x": 85, "y": 75}, {"x": 15, "y": 75}], "triggerAction": "Guard Ping", "dwellTimeSeconds": 6, "status": "online", "fps": 30, "resolution": "4K (3840x2160)", "fovAngle": 110, "coordinates": {"lat": 31.644, "lng": 74.894}},
        {"id": "CAM-A04-NORTH", "name": "Sector Alpha-4 Gully Pass (PTZ-04)", "sector": "Sector Alpha-4", "rtspUrl": "rtsp://10.24.4.101:554/live/stream1", "type": "ptz", "aiActive": False, "personDetection": True, "vehicleDetection": True, "weaponDetection": True, "confidenceThreshold": 80, "minObjectSizePx": 28, "zonePolygon": [{"x": 20, "y": 20}, {"x": 80, "y": 20}, {"x": 80, "y": 80}, {"x": 20, "y": 80}], "triggerAction": "QRF Dispatch", "dwellTimeSeconds": 5, "status": "signal_lost", "fps": 0, "resolution": "4K (3840x2160)", "fovAngle": 90, "coordinates": {"lat": 31.656, "lng": 74.908}, "pan": 180, "tilt": 0, "zoom": 1.0},
        {"id": "CAM-A05-HIGHWAY", "name": "Sector Alpha-5 Highway ANPR Intercept", "sector": "Sector Alpha-5", "rtspUrl": "rtsp://10.24.5.102:554/live/anpr", "type": "fixed", "aiActive": True, "personDetection": False, "vehicleDetection": True, "weaponDetection": False, "confidenceThreshold": 90, "minObjectSizePx": 50, "zonePolygon": [{"x": 30, "y": 30}, {"x": 70, "y": 30}, {"x": 75, "y": 85}, {"x": 25, "y": 85}], "triggerAction": "Guard Ping", "dwellTimeSeconds": 1, "status": "online", "fps": 60, "resolution": "4K (3840x2160)", "fovAngle": 60, "coordinates": {"lat": 31.671, "lng": 74.926}},
        {"id": "CAM-A06-TOWER", "name": "Sector Alpha-6 Watchtower Panoramic", "sector": "Sector Alpha-6", "rtspUrl": "rtsp://10.24.6.101:554/live/stream1", "type": "fixed", "aiActive": True, "personDetection": True, "vehicleDetection": True, "weaponDetection": True, "confidenceThreshold": 84, "minObjectSizePx": 30, "zonePolygon": [{"x": 10, "y": 20}, {"x": 90, "y": 20}, {"x": 85, "y": 85}, {"x": 15, "y": 85}], "triggerAction": "Siren Alarm", "dwellTimeSeconds": 4, "status": "online", "fps": 30, "resolution": "4K (3840x2160)", "fovAngle": 105, "coordinates": {"lat": 31.681, "lng": 74.935}},
    ],
    "sectors": [
        {"id": "SEC-01", "name": "Sector Alpha-1 (Main Highway & Checkpoint)", "code": "ALPHA-1", "postsCount": 2, "staffedCount": 2, "threatLevel": "high", "centerCoordinates": {"lat": 31.6234, "lng": 74.8712}, "polygon": [{"lat": 31.618, "lng": 74.865}, {"lat": 31.628, "lng": 74.867}, {"lat": 31.63, "lng": 74.878}, {"lat": 31.62, "lng": 74.876}], "posts": [{"id": "POST-A1-MAIN", "name": "Alpha-1 Command Gate", "coordinates": {"lat": 31.6234, "lng": 74.8712}, "staffed": True, "guardId": "GRD-01"}, {"id": "POST-HQ-COMMAND", "name": "SSB Tactical HQ Bunker", "coordinates": {"lat": 31.625, "lng": 74.873}, "staffed": True, "guardId": "GRD-05"}], "tripwires": [{"id": "TW-A1-01", "name": "Main Gate Optical Laser Grid", "start": {"lat": 31.622, "lng": 74.869}, "end": {"lat": 31.625, "lng": 74.875}, "armed": True}]},
        {"id": "SEC-02", "name": "Sector Alpha-2 (Riverine Crossing & Marsh)", "code": "ALPHA-2", "postsCount": 1, "staffedCount": 1, "threatLevel": "critical", "centerCoordinates": {"lat": 31.634, "lng": 74.883}, "polygon": [{"lat": 31.628, "lng": 74.877}, {"lat": 31.639, "lng": 74.88}, {"lat": 31.641, "lng": 74.891}, {"lat": 31.63, "lng": 74.888}], "posts": [{"id": "POST-A2-RIVER", "name": "Riverine Culvert Post 2", "coordinates": {"lat": 31.632, "lng": 74.882}, "staffed": True, "guardId": "GRD-02"}], "tripwires": [{"id": "TW-A2-01", "name": "Riverbed Seismic Sensor String", "start": {"lat": 31.631, "lng": 74.88}, "end": {"lat": 31.636, "lng": 74.886}, "armed": True}]},
        {"id": "SEC-03", "name": "Sector Alpha-3 (Dense Forest Ridge)", "code": "ALPHA-3", "postsCount": 1, "staffedCount": 1, "threatLevel": "elevated", "centerCoordinates": {"lat": 31.645, "lng": 74.895}, "polygon": [{"lat": 31.639, "lng": 74.889}, {"lat": 31.65, "lng": 74.892}, {"lat": 31.652, "lng": 74.903}, {"lat": 31.641, "lng": 74.9}], "posts": [{"id": "POST-A3-RIDGE", "name": "Forest Ridge Observation Post", "coordinates": {"lat": 31.644, "lng": 74.894}, "staffed": True, "guardId": "GRD-03"}], "tripwires": [{"id": "TW-A3-01", "name": "Ridge Infrared Breakbeam", "start": {"lat": 31.642, "lng": 74.891}, "end": {"lat": 31.648, "lng": 74.898}, "armed": True}]},
        {"id": "SEC-04", "name": "Sector Alpha-4 (Gully Pass & Ravine)", "code": "ALPHA-4", "postsCount": 1, "staffedCount": 0, "threatLevel": "high", "centerCoordinates": {"lat": 31.657, "lng": 74.909}, "polygon": [{"lat": 31.65, "lng": 74.901}, {"lat": 31.661, "lng": 74.905}, {"lat": 31.663, "lng": 74.916}, {"lat": 31.652, "lng": 74.913}], "posts": [{"id": "POST-A4-RIDGE", "name": "Gully Ravine Sentry 4 (UNSTAFFED)", "coordinates": {"lat": 31.656, "lng": 74.908}, "staffed": False, "guardId": "GRD-04"}], "tripwires": [{"id": "TW-A4-01", "name": "Ravine Smart Micro-Radar Line", "start": {"lat": 31.654, "lng": 74.905}, "end": {"lat": 31.659, "lng": 74.913}, "armed": False}]},
        {"id": "SEC-05", "name": "Sector Alpha-5 (Command Bunker North)", "code": "ALPHA-5", "postsCount": 1, "staffedCount": 1, "threatLevel": "elevated", "centerCoordinates": {"lat": 31.669, "lng": 74.923}, "polygon": [{"lat": 31.661, "lng": 74.914}, {"lat": 31.672, "lng": 74.918}, {"lat": 31.675, "lng": 74.93}, {"lat": 31.663, "lng": 74.926}], "posts": [{"id": "POST-A5-BUNKER", "name": "North Bunker Heavy Weapons Nest", "coordinates": {"lat": 31.668, "lng": 74.922}, "staffed": True, "guardId": "GRD-05"}], "tripwires": [{"id": "TW-A5-01", "name": "Perimeter Piezo-Electric Fence Line", "start": {"lat": 31.666, "lng": 74.919}, "end": {"lat": 31.672, "lng": 74.927}, "armed": True}]},
        {"id": "SEC-06", "name": "Sector Alpha-6 (Watchtower & Wetland Perimeter)", "code": "ALPHA-6", "postsCount": 1, "staffedCount": 1, "threatLevel": "low", "centerCoordinates": {"lat": 31.682, "lng": 74.936}, "polygon": [{"lat": 31.673, "lng": 74.928}, {"lat": 31.685, "lng": 74.932}, {"lat": 31.689, "lng": 74.945}, {"lat": 31.676, "lng": 74.941}], "posts": [{"id": "POST-A6-WATCHTOWER", "name": "High-Gain 360 Watchtower", "coordinates": {"lat": 31.681, "lng": 74.935}, "staffed": True, "guardId": "GRD-03"}], "tripwires": [{"id": "TW-A6-01", "name": "Wetland Perimeter Microwave Barrier", "start": {"lat": 31.679, "lng": 74.931}, "end": {"lat": 31.686, "lng": 74.942}, "armed": True}]},
    ],
    "activityLog": [
        {"id": "LOG-1001", "timestamp": "2026-08-27T11:43:00+05:30", "actorId": "GRD-01", "actorName": "Sub-Inspector Rajesh Sharma", "actionType": "alert_acknowledged", "targetType": "alert", "targetId": "ALT-2026-901", "sector": "Sector Alpha-2", "details": "Acknowledged critical perimeter infiltration alert and dispatched QRF Alpha Unit."},
        {"id": "LOG-1002", "timestamp": "2026-08-27T10:45:20+05:30", "actorId": "GRD-03", "actorName": "Constable Amit Gurung", "actionType": "patrol_checkin", "targetType": "post", "targetId": "POST-A3-RIDGE", "sector": "Sector Alpha-3", "details": "Routine forest ridge patrol check-in verified clear."},
        {"id": "LOG-1003", "timestamp": "2026-08-27T10:16:00+05:30", "actorId": "GRD-01", "actorName": "Sub-Inspector Rajesh Sharma", "actionType": "alert_escalated", "targetType": "alert", "targetId": "ALT-2026-902", "sector": "Sector Alpha-1", "details": "Escalated weapon detection alert to Tactical Command HQ."},
        {"id": "LOG-1004", "timestamp": "2026-08-27T08:00:10+05:30", "actorId": "GRD-03", "actorName": "Constable Amit Gurung", "actionType": "shift_started", "targetType": "post", "targetId": "POST-A3-RIDGE", "sector": "Sector Alpha-3", "details": "Morning shift commenced with equipment readiness check."},
        {"id": "LOG-1005", "timestamp": "2026-08-27T06:05:00+05:30", "actorId": "SYSTEM", "actorName": "SYSTEM", "actionType": "shift_started", "targetType": "system", "targetId": "SYSTEM-ROSTER", "sector": "All Sectors", "details": "Automated roster rollover: Alpha-4 post flagged as understaffed."},
    ],
    "pois": [
        {"id": "POI-901", "name": "Tariq Shadow Masood", "alias": "Operative 09", "threatLevel": "critical", "lastSightedSector": "Sector Alpha-2", "lastSightedTimestamp": "2026-08-27T08:50:00+05:30", "facialMatchConfidence": 94.6, "flaggedReason": "Cross-border logistics watchlist match.", "photoUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300", "status": "Active Watchlist"},
        {"id": "POI-902", "name": "Harish Kabuli Verma", "alias": "Broker Kabuli", "threatLevel": "high", "lastSightedSector": "Sector Alpha-5", "lastSightedTimestamp": "2026-08-27T09:30:10+05:30", "facialMatchConfidence": 89.2, "flaggedReason": "Forged vehicle registration facilitator.", "photoUrl": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300", "status": "Active Watchlist"},
    ],
    "anprRecords": [
        {"id": "ANPR-8801", "plateNumber": "PB-02-AK-9921", "vehicleType": "Modified 4x4 SUV", "timestamp": "2026-08-27T09:30:10+05:30", "sourceCameraId": "CAM-A05-HIGHWAY", "sector": "Sector Alpha-5", "status": "Blacklisted", "matchNotes": "Matched national intelligence vehicle watchlist."},
        {"id": "ANPR-8802", "plateNumber": "JK-01-M-4412", "vehicleType": "Heavy Multi-Axle Freight Truck", "timestamp": "2026-08-27T08:45:00+05:30", "sourceCameraId": "CAM-A01-GATE", "sector": "Sector Alpha-1", "status": "Authorized", "matchNotes": "Valid military supply pass verified."},
    ],
    "system": {"lockdownActive": False, "defconLevel": 2},
}


def initial_state() -> dict:
    return deepcopy(DEMO_STATE)
