import React, { useState, useMemo } from 'react';
import { 
  Network, 
  Sparkles, 
  ZoomIn, 
  ZoomOut, 
  Compass, 
  Layers, 
  Terminal, 
  CheckCircle,
  FolderGit2,
  Lightbulb,
  Target
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
  type: 'commander' | 'mission' | 'intel' | 'directive';
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
  directives,
  onTriggerGraphifyScan,
}) => {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  // Generate dynamic 2D graph layout based on real items
  const { nodes, links } = useMemo(() => {
    const n: GraphNode[] = [];
    const l: GraphLink[] = [];

    // Center Node: Commander / AQLIYA
    n.push({
      id: 'commander-root',
      label: 'عقلية | AQLIYA HQ',
      type: 'commander',
      x: 350,
      y: 250,
    });

    // Missions orbiting center
    missions.forEach((m, idx) => {
      const angle = (idx / Math.max(1, missions.length)) * 2 * Math.PI;
      const x = 350 + Math.cos(angle) * 150;
      const y = 250 + Math.sin(angle) * 150;
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

    // Intel Items linked to their missions or commander
    intel.slice(0, 12).forEach((item, idx) => {
      const parentId = item.mission_id ? `mission-${item.mission_id}` : 'commander-root';
      const angle = (idx / Math.max(1, Math.min(12, intel.length))) * 2 * Math.PI + 0.5;
      const x = 350 + Math.cos(angle) * 250;
      const y = 250 + Math.sin(angle) * 250;
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
  }, [missions, intel, directives]);

  const filteredNodes = useMemo(() => {
    if (!searchQuery.trim()) return nodes;
    return nodes.filter((node) => node.label.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [nodes, searchQuery]);

  return (
    <div className="flex flex-col h-full hud-panel rounded-xl border border-slate-800 p-4 overflow-hidden relative">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3 z-10 bg-[#0e111a]/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <Compass className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>رادار الأفكار المعرفي</span>
              <span className="text-[10px] font-mono-hud text-emerald-400">// GRAPHIFY RADAR</span>
            </h2>
            <p className="text-[11px] text-slate-400">شبكة العلاقات بين المشاريع، الاستراتيجيات، والحلول</p>
          </div>
        </div>

        {/* Scan & Zoom Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              tacticalAudio.playConfirm();
              onTriggerGraphifyScan();
            }}
            className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 px-2.5 py-1 rounded-lg transition-all active:scale-95 glow-emerald"
            title="إعادة بناء الشبكة بـ Graphify AST"
          >
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            <span className="hidden sm:inline">مسح Graphify</span>
          </button>

          <div className="flex items-center rounded-lg border border-slate-800 bg-slate-900/60 p-0.5">
            <button
              onClick={() => {
                tacticalAudio.playBlip();
                setZoomLevel((z) => Math.min(1.6, z + 0.15));
              }}
              className="p-1 text-slate-400 hover:text-white"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => {
                tacticalAudio.playBlip();
                setZoomLevel((z) => Math.max(0.6, z - 0.15));
              }}
              className="p-1 text-slate-400 hover:text-white"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Interactive SVG Radar Canvas */}
      <div className="relative flex-1 rounded-xl border border-slate-800/80 bg-[#06080d] overflow-hidden flex items-center justify-center">
        {/* Radar concentric circular guides */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <div className="w-[180px] h-[180px] rounded-full border border-emerald-500" />
          <div className="w-[320px] h-[320px] rounded-full border border-emerald-500 absolute" />
          <div className="w-[460px] h-[460px] rounded-full border border-emerald-500 absolute" />
          {/* Radar sweeping scan line */}
          <div className="absolute w-[460px] h-[460px] rounded-full border-t-2 border-emerald-400/40 animate-spin" style={{ animationDuration: '10s' }} />
        </div>

        <svg
          viewBox="0 0 700 500"
          className="w-full h-full cursor-crosshair transition-transform duration-300"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {/* Links / Edges */}
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
                stroke="#1f293d"
                strokeWidth="1.5"
                strokeDasharray="4 2"
                className="animate-pulse"
              />
            );
          })}

          {/* Nodes */}
          {nodes.map((node) => {
            const isSelected = selectedNode?.id === node.id;
            const isMatch = filteredNodes.some((fn) => fn.id === node.id);

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                onClick={() => {
                  tacticalAudio.playBlip();
                  setSelectedNode(node);
                }}
                className="cursor-pointer group"
              >
                {/* Node Aura */}
                <circle
                  r={node.type === 'commander' ? 24 : node.type === 'mission' ? 16 : 12}
                  className={`transition-all duration-300 ${
                    node.type === 'commander'
                      ? 'fill-emerald-500/20 stroke-emerald-400 stroke-2'
                      : node.type === 'mission'
                      ? 'fill-cyan-500/20 stroke-cyan-400 stroke-2'
                      : 'fill-amber-500/20 stroke-amber-400 stroke-1'
                  } ${isSelected ? 'stroke-white stroke-[3px] scale-125' : ''} ${!isMatch ? 'opacity-30' : ''}`}
                />

                {/* Node Center Dot */}
                <circle
                  r={node.type === 'commander' ? 8 : 4}
                  className={
                    node.type === 'commander'
                      ? 'fill-emerald-400'
                      : node.type === 'mission'
                      ? 'fill-cyan-400'
                      : 'fill-amber-400'
                  }
                />

                {/* Node Label */}
                <text
                  y={node.type === 'commander' ? 36 : 24}
                  textAnchor="middle"
                  className={`text-[10px] font-mono-hud select-none font-bold ${
                    isSelected ? 'fill-white' : 'fill-slate-300'
                  }`}
                >
                  {node.label.length > 18 ? node.label.slice(0, 16) + '...' : node.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Selected Node Details Card Popup */}
        {selectedNode && (
          <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-xs hud-panel rounded-xl border border-slate-700 p-3 shadow-2xl z-20">
            <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-slate-800">
              <span className="text-[10px] font-mono-hud text-emerald-400 font-bold uppercase">
                // NODE: {selectedNode.type}
              </span>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-xs text-slate-500 hover:text-white"
              >
                ✕
              </button>
            </div>
            <h4 className="text-xs font-bold text-white mb-1">{selectedNode.label}</h4>
            {selectedNode.data?.problem_solved && (
              <p className="text-[11px] text-amber-300/90 leading-relaxed mb-1">
                💡 {selectedNode.data.problem_solved}
              </p>
            )}
            {selectedNode.data?.next_ops && (
              <p className="text-[11px] text-cyan-300/90 leading-relaxed">
                🎯 {selectedNode.data.next_ops}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
