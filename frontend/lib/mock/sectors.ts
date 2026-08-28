import { Sector } from "./types";

export const MOCK_SECTORS: Sector[] = [
  {
    id: "SEC-01",
    name: "Sector Alpha-1 (Main Highway & Checkpoint)",
    code: "ALPHA-1",
    postsCount: 2,
    staffedCount: 2,
    threatLevel: "high",
    centerCoordinates: { lat: 31.6234, lng: 74.8712 },
    polygon: [
      { lat: 31.618, lng: 74.865 },
      { lat: 31.628, lng: 74.867 },
      { lat: 31.63, lng: 74.878 },
      { lat: 31.62, lng: 74.876 },
    ],
    posts: [
      { id: "POST-A1-MAIN", name: "Alpha-1 Command Gate", coordinates: { lat: 31.6234, lng: 74.8712 }, staffed: true, guardId: "GRD-01" },
      { id: "POST-HQ-COMMAND", name: "SSB Tactical HQ Bunker", coordinates: { lat: 31.625, lng: 74.873 }, staffed: true, guardId: "GRD-10" },
    ],
    tripwires: [
      { id: "TW-A1-01", name: "Main Gate Optical Laser Grid", start: { lat: 31.622, lng: 74.869 }, end: { lat: 31.625, lng: 74.875 }, armed: true },
    ],
  },
  {
    id: "SEC-02",
    name: "Sector Alpha-2 (Riverine Crossing & Marsh)",
    code: "ALPHA-2",
    postsCount: 1,
    staffedCount: 1,
    threatLevel: "critical",
    centerCoordinates: { lat: 31.634, lng: 74.883 },
    polygon: [
      { lat: 31.628, lng: 74.877 },
      { lat: 31.639, lng: 74.88 },
      { lat: 31.641, lng: 74.891 },
      { lat: 31.63, lng: 74.888 },
    ],
    posts: [
      { id: "POST-A2-GATE", name: "Riverine Culvert Post 2", coordinates: { lat: 31.632, lng: 74.882 }, staffed: true, guardId: "GRD-02" },
    ],
    tripwires: [
      { id: "TW-A2-01", name: "Ravi Riverbed Seismic Sensor String", start: { lat: 31.631, lng: 74.88 }, end: { lat: 31.636, lng: 74.886 }, armed: true },
    ],
  },
  {
    id: "SEC-03",
    name: "Sector Alpha-3 (Dense Forest Ridge)",
    code: "ALPHA-3",
    postsCount: 1,
    staffedCount: 1,
    threatLevel: "elevated",
    centerCoordinates: { lat: 31.645, lng: 74.895 },
    polygon: [
      { lat: 31.639, lng: 74.889 },
      { lat: 31.65, lng: 74.892 },
      { lat: 31.652, lng: 74.903 },
      { lat: 31.641, lng: 74.9 },
    ],
    posts: [
      { id: "POST-A3-OUTPOST", name: "Forest Ridge Observation Post", coordinates: { lat: 31.644, lng: 74.894 }, staffed: true, guardId: "GRD-03" },
    ],
    tripwires: [
      { id: "TW-A3-01", name: "Ridge Infrared Breakbeam", start: { lat: 31.642, lng: 74.891 }, end: { lat: 31.648, lng: 74.898 }, armed: true },
    ],
  },
  {
    id: "SEC-04",
    name: "Sector Alpha-4 (Gully Pass & Ravine)",
    code: "ALPHA-4",
    postsCount: 1,
    staffedCount: 0, // Deliberate GAP: HC Ramesh is unreachable, post shows understaffed!
    threatLevel: "high",
    centerCoordinates: { lat: 31.657, lng: 74.909 },
    polygon: [
      { lat: 31.65, lng: 74.901 },
      { lat: 31.661, lng: 74.905 },
      { lat: 31.663, lng: 74.916 },
      { lat: 31.652, lng: 74.913 },
    ],
    posts: [
      { id: "POST-A4-RIDGE", name: "Gully Ravine Sentry 4 (UNSTAFFED / COMMS DOWN)", coordinates: { lat: 31.656, lng: 74.908 }, staffed: false, guardId: "GRD-04" },
    ],
    tripwires: [
      { id: "TW-A4-01", name: "Ravine Smart Micro-Radar Line", start: { lat: 31.654, lng: 74.905 }, end: { lat: 31.659, lng: 74.913 }, armed: false },
    ],
  },
  {
    id: "SEC-05",
    name: "Sector Alpha-5 (Command Bunker North)",
    code: "ALPHA-5",
    postsCount: 1,
    staffedCount: 1,
    threatLevel: "elevated",
    centerCoordinates: { lat: 31.669, lng: 74.923 },
    polygon: [
      { lat: 31.661, lng: 74.914 },
      { lat: 31.672, lng: 74.918 },
      { lat: 31.675, lng: 74.93 },
      { lat: 31.663, lng: 74.926 },
    ],
    posts: [
      { id: "POST-A5-BUNKER", name: "North Bunker Heavy Weapons Nest", coordinates: { lat: 31.668, lng: 74.922 }, staffed: true, guardId: "GRD-05" },
    ],
    tripwires: [
      { id: "TW-A5-01", name: "Perimeter Piezo-Electric Fence Line", start: { lat: 31.666, lng: 74.919 }, end: { lat: 31.672, lng: 74.927 }, armed: true },
    ],
  },
  {
    id: "SEC-06",
    name: "Sector Alpha-6 (Watchtower & Wetland Perimeter)",
    code: "ALPHA-6",
    postsCount: 1,
    staffedCount: 1,
    threatLevel: "low",
    centerCoordinates: { lat: 31.682, lng: 74.936 },
    polygon: [
      { lat: 31.673, lng: 74.928 },
      { lat: 31.685, lng: 74.932 },
      { lat: 31.689, lng: 74.945 },
      { lat: 31.676, lng: 74.941 },
    ],
    posts: [
      { id: "POST-A6-WATCHTOWER", name: "High-Gain 360 Watchtower", coordinates: { lat: 31.681, lng: 74.935 }, staffed: true, guardId: "GRD-06" },
    ],
    tripwires: [
      { id: "TW-A6-01", name: "Wetland Perimeter Microwave Barrier", start: { lat: 31.679, lng: 74.931 }, end: { lat: 31.686, lng: 74.942 }, armed: true },
    ],
  },
];
