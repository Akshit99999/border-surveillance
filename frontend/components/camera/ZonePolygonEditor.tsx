import React, { useState, useRef } from "react";
import { Point2D } from "@/lib/types";
import { TacticalButton } from "../shared/TacticalButton";
import { Save, RotateCcw, Plus, Trash2, CheckCircle2 } from "lucide-react";
import { tacticalSound } from "@/lib/sound";

interface ZonePolygonEditorProps {
  initialPolygon: Point2D[];
  cameraId: string;
  cameraName: string;
  onCommit: (polygon: Point2D[]) => void;
}

export const ZonePolygonEditor: React.FC<ZonePolygonEditorProps> = ({
  initialPolygon,
  cameraId,
  cameraName,
  onCommit,
}) => {
  const [polygon, setPolygon] = useState<Point2D[]>(initialPolygon || []);
  const [committedSuccess, setCommittedSuccess] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    tacticalSound.playClick();
    setPolygon((prev) => [...prev, { x, y }]);
    setCommittedSuccess(false);
  };

  const handleReset = () => {
    tacticalSound.playClick();
    setPolygon([
      { x: 15, y: 25 },
      { x: 85, y: 25 },
      { x: 90, y: 85 },
      { x: 10, y: 85 },
    ]);
    setCommittedSuccess(false);
  };

  const handleClear = () => {
    tacticalSound.playClick();
    setPolygon([]);
    setCommittedSuccess(false);
  };

  const handleCommit = () => {
    tacticalSound.playAlert();
    onCommit(polygon);
    setCommittedSuccess(true);
    setTimeout(() => setCommittedSuccess(false), 3000);
  };

  // Convert points array to SVG polygon string
  const pointsString = polygon.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div className="space-y-3 font-mono">
      {/* Visual Canvas Area */}
      <div
        ref={containerRef}
        onClick={handleCanvasClick}
        className="relative w-full aspect-video bg-slate-950 border-2 border-cyan-500/40 rounded cursor-crosshair overflow-hidden group select-none shadow-inner"
      >
        {/* Synthetic Video Background Preview */}
        <div className="absolute inset-0 bg-[radial-gradient(#06b6d415_1px,transparent_1px)] [background-size:20px_20px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent" />

        {/* Camera Info Watermark */}
        <div className="absolute top-2 left-2 z-10 text-[10px] bg-slate-900/90 border border-slate-700 px-2 py-1 rounded text-cyan-300">
          CONFIGURING DETECTION ZONE: {cameraId}
        </div>

        {/* SVG Detection Polygon Layer */}
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full pointer-events-none"
        >
          {polygon.length > 2 && (
            <polygon
              points={pointsString}
              className="fill-cyan-500/25 stroke-cyan-400 stroke-[0.8] shadow-[0_0_10px_#22d3ee]"
            />
          )}

          {/* Vertex Points */}
          {polygon.map((p, idx) => (
            <g key={idx}>
              <circle
                cx={p.x}
                cy={p.y}
                r="1.8"
                className="fill-rose-500 stroke-white stroke-[0.5] animate-pulse"
              />
              <text
                x={p.x + 2}
                y={p.y - 2}
                fill="#38bdf8"
                fontSize="3"
                fontFamily="monospace"
              >
                V{idx + 1} ({p.x}%, {p.y}%)
              </text>
            </g>
          ))}
        </svg>

        {/* Helper Hint */}
        <div className="absolute bottom-2 inset-x-2 z-10 text-center text-[10px] text-slate-400 bg-slate-950/80 py-1 border border-slate-800 rounded">
          Click anywhere on the feed to add polygon vertices. Min 3 vertices required to define zone.
        </div>
      </div>

      {/* Editor Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="text-cyan-300 font-bold">{polygon.length}</span> Vertices Defined
          {committedSuccess && (
            <span className="text-emerald-400 flex items-center gap-1 font-bold animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5" /> Zone Map Committed!
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded text-xs flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" /> Reset Default
          </button>

          <button
            onClick={handleClear}
            className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-rose-300 border border-slate-700 rounded text-xs flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" /> Clear
          </button>

          <TacticalButton
            variant="primary"
            size="sm"
            onClick={handleCommit}
            disabled={polygon.length < 3}
            icon={<Save className="w-3.5 h-3.5" />}
          >
            COMMIT ZONE MAP
          </TacticalButton>
        </div>
      </div>
    </div>
  );
};
