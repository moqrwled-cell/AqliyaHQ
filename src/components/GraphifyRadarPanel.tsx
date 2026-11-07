import React, { useState, useMemo } from 'react';
import { 
  Compass, 
  ZoomIn, 
  ZoomOut, 
  Sparkles,
  X
} from 'lucide-react';
import type { Mission, IntelItem, StrategicDirective } from '../types';
import { tacticalAudio } from '../lib/audio';

interface GraphifyRadarPanelProps {
  missions: Mission[];
  intel: IntelItem[];
  directives: StrategicDirective[];
  onTriggerGraphifyScan: () => void;
}

interface GraphNode {
  id: string;
  label: string;
  type: 'commander' | 'mission' | 'intel';
  x: number;
  y: number;
  data?: any;
}

interface GraphLink {
  source: string;
  target: string;
}

export const GraphifyRadarPanel: React.FC<GraphifyRadarPanelProps> = ({
  missions,
  intel,
  onTriggerGraphifyScan,
}) => {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  const { nodes, links } = useMemo(() => {
    const n: GraphNode[] = [];
    const l: GraphLink[] = [];

    // Center Node: Commander
    n.push({
      id: 'commander-root',
      label: 'عقلية HQ',
      type: 'commander',
      x: 350,
      y: 220,
    });

    // Missions orbiting
    missions.forEach((m, idx) => {
      const angle = (idx / Math.max(1, missions.length)) * 2 * Math.PI;
      const x = 350 + Math.cos(angle) * 140;
      const y = 220 + Math.sin(angle) * 130;
      n.push({
        id: `mission-${m.id}`,
        label: m.title,
        type: 'mission',
        x,
        y,
        data: m,
      });
      l.push({ source: 'commander-root', target: `mission-${m.id}` });
    });

    // Intel items
    intel.slice(0, 10).forEach((item, idx) => {
      const parentId = item.mission_id ? `mission-${item.mission_id}` : 'commander-root';
      const angle = (idx / Math.max(1, Math.min(10, intel.length))) * 2 * Math.PI + 0.3;
      const x = 350 + Math.cos(angle) * 220;
      const y = 220 + Math.sin(angle) * 190;
      n.push({
        id: `intel-${item.id}`,
        label: item.title,
        type: 'intel',
        x,
        y,
        data: item,
      });
      l.push({ source: parentId, target: `intel-${item.id}` });
    });

    return { nodes: n, links: l };
  }, [missions, intel]);

  return (
    <div className="flex flex-col h-full craft-surface rounded-2xl p-4 overflow-hidden relative text-right">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b craft-border mb-3 z-10 bg-transparent">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-zinc-800/80 border craft-border text-zinc-200">
            <Compass className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-zinc-100">رادار الأفكار المعرفي</h2>
              <span className="text-[10px] font-telemetry px-1.5 py-0.5 rounded bg-zinc-800/80 border craft-border text-zinc-400">
                GRAPHIFY
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">شبكة الروابط بين المشاريع والحلول</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              tacticalAudio.playConfirm();
              onTriggerGraphifyScan();
            }}
            className="flex items-center gap-1 text-xs font-medium text-zinc-200 bg-zinc-800 hover:bg-zinc-700 border craft-border px-2.5 py-1.5 rounded-lg transition-all active:scale-95 shadow-sm"
            title="إعادة بناء الشبكة بـ Graphify AST"
          >
            <Sparkles className="h-3.5 w-3.5 text-zinc-400" />
            <span className="hidden sm:inline">مسح AST</span>
          </button>

          <div className="flex items-center rounded-lg border craft-border bg-zinc-900 p-0.5">
            <button
              onClick={() => {
                tacticalAudio.playBlip();
                setZoomLevel((z) => Math.min(1.5, z + 0.15));
              }}
              className="p-1 text-zinc-400 hover:text-white"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => {
                tacticalAudio.playBlip();
                setZoomLevel((z) => Math.max(0.7, z - 0.15));
              }}
              className="p-1 text-zinc-400 hover:text-white"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative flex-1 rounded-xl border craft-border bg-black/40 overflow-hidden flex items-center justify-center">
        <svg
          viewBox="0 0 700 440"
          className="w-full h-full cursor-crosshair transition-transform duration-300"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {links.map((link, idx) => {
            const s = nodes.find((n) => n.id === link.source);
            const t = nodes.find((n) => n.id === link.target);
            if (!s || !t) return null;
            return (
              <line
                key={idx}
                x1={s.x}
                y1={s.y}
                x2={t.x}
                y2={t.y}
                stroke="rgba(255, 255, 255, 0.12)"
                strokeWidth="1"
              />
            );
          })}

          {nodes.map((node) => {
            const isSelected = selectedNode?.id === node.id;
            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                onClick={() => {
                  tacticalAudio.playBlip();
                  setSelectedNode(node);
                }}
                className="cursor-pointer"
              >
                <circle
                  r={node.type === 'commander' ? 18 : node.type === 'mission' ? 13 : 9}
                  className={`transition-all duration-200 ${
                    node.type === 'commander'
                      ? 'fill-zinc-800 stroke-zinc-400 stroke-2'
                      : node.type === 'mission'
                      ? 'fill-zinc-900 stroke-emerald-500 stroke-2'
                      : 'fill-zinc-950 stroke-amber-500/80 stroke-1'
                  } ${isSelected ? 'stroke-white stroke-[2.5px]' : ''}`}
                />

                <circle
                  r={node.type === 'commander' ? 5 : 3}
                  className={
                    node.type === 'commander'
                      ? 'fill-zinc-100'
                      : node.type === 'mission'
                      ? 'fill-emerald-400'
                      : 'fill-amber-400'
                  }
                />

                <text
                  y={node.type === 'commander' ? 28 : 20}
                  textAnchor="middle"
                  className={`text-[10px] font-telemetry select-none ${
                    isSelected ? 'fill-white font-bold' : 'fill-zinc-400'
                  }`}
                >
                  {node.label.length > 18 ? node.label.slice(0, 16) + '...' : node.label}
                </text>
              </g>
            );
          })}
        </svg>

        {selectedNode && (
          <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-xs craft-surface-elevated rounded-xl p-3 shadow-xl z-20 text-right">
            <div className="flex items-center justify-between mb-1 pb-1 border-b craft-border">
              <span className="text-[10px] font-telemetry text-zinc-400 font-bold uppercase">
                // {selectedNode.type}
              </span>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-xs text-zinc-500 hover:text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
            <h4 className="text-xs font-bold text-zinc-100 mb-1">{selectedNode.label}</h4>
            {selectedNode.data?.problem_solved && (
              <p className="text-[11px] text-amber-300/90 leading-relaxed">
                💡 {selectedNode.data.problem_solved}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
