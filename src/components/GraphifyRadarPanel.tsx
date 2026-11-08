import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Compass, 
  ZoomIn, 
  ZoomOut, 
  Maximize2,
  RefreshCw,
  Sparkles,
  Layers,
  Crosshair,
  Radio,
  X,
  ExternalLink
} from 'lucide-react';
import type { Mission, IntelItem, StrategicDirective } from '../types';
import { tacticalAudio } from '../lib/audio';

interface GraphifyRadarPanelProps {
  missions: Mission[];
  intel: IntelItem[];
  directives: StrategicDirective[];
  onTriggerGraphifyScan: () => void;
  onSelectMission?: (m: Mission) => void;
}

interface SimNode {
  id: string;
  label: string;
  subLabel?: string;
  type: 'commander' | 'mission' | 'directive' | 'intel';
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  glowColor: string;
  data?: any;
}

interface SimLink {
  sourceId: string;
  targetId: string;
}

export const GraphifyRadarPanel: React.FC<GraphifyRadarPanelProps> = ({
  missions,
  intel,
  directives,
  onTriggerGraphifyScan,
  onSelectMission,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  
  const [selectedNode, setSelectedNode] = useState<SimNode | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [radarMode, setRadarMode] = useState<'orbital' | 'neural'>('neural');
  const [filterType, setFilterType] = useState<'all' | 'missions' | 'intel'>('all');
  
  // Dragging state
  const draggingNodeRef = useRef<SimNode | null>(null);
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0 });

  // Persistent nodes and links state
  const nodesRef = useRef<SimNode[]>([]);
  const linksRef = useRef<SimLink[]>([]);
  const sweepAngleRef = useRef(0);
  const animFrameIdRef = useRef<number | null>(null);

  // Initialize graph nodes and links
  useEffect(() => {
    const width = containerRef.current?.clientWidth || 700;
    const height = containerRef.current?.clientHeight || 450;
    const cx = width / 2;
    const cy = height / 2;

    const n: SimNode[] = [];
    const l: SimLink[] = [];

    // Commander Hub Root
    n.push({
      id: 'root-hq',
      label: 'عقلية HQ',
      subLabel: 'نواة العمليات المركزية',
      type: 'commander',
      x: cx,
      y: cy,
      vx: 0,
      vy: 0,
      radius: 22,
      color: '#10b981',
      glowColor: 'rgba(16, 185, 129, 0.4)',
    });

    // Strategic Directives
    directives.slice(0, 4).forEach((d, idx) => {
      const angle = (idx / Math.max(1, directives.length)) * Math.PI * 2 + 0.5;
      const dist = 110;
      n.push({
        id: `dir-${d.id}`,
        label: d.title,
        subLabel: 'استراتيجية عليا',
        type: 'directive',
        x: cx + Math.cos(angle) * dist,
        y: cy + Math.sin(angle) * dist,
        vx: 0,
        vy: 0,
        radius: 14,
        color: '#f59e0b',
        glowColor: 'rgba(245, 158, 11, 0.4)',
        data: d,
      });
      l.push({ sourceId: 'root-hq', targetId: `dir-${d.id}` });
    });

    // Missions
    missions.forEach((m, idx) => {
      const angle = (idx / Math.max(1, missions.length)) * Math.PI * 2;
      const dist = 175;
      const isNexus = m.title.toLowerCase().includes('nexus');
      n.push({
        id: `mission-${m.id}`,
        label: m.title,
        subLabel: `[${m.code}] ${m.progress_percent}%`,
        type: 'mission',
        x: cx + Math.cos(angle) * dist,
        y: cy + Math.sin(angle) * dist,
        vx: 0,
        vy: 0,
        radius: isNexus ? 18 : 15,
        color: isNexus ? '#06b6d4' : '#38bdf8',
        glowColor: isNexus ? 'rgba(6, 182, 212, 0.5)' : 'rgba(56, 189, 248, 0.3)',
        data: m,
      });
      l.push({ sourceId: 'root-hq', targetId: `mission-${m.id}` });
    });

    // Intel Items
    intel.slice(0, 12).forEach((item, idx) => {
      const angle = (idx / Math.max(1, Math.min(12, intel.length))) * Math.PI * 2 + 0.2;
      const dist = 245;
      const targetMissionId = item.mission_id ? `mission-${item.mission_id}` : 'root-hq';
      n.push({
        id: `intel-${item.id}`,
        label: item.title,
        subLabel: item.platform || 'WEB INTEL',
        type: 'intel',
        x: cx + Math.cos(angle) * dist,
        y: cy + Math.sin(angle) * dist,
        vx: 0,
        vy: 0,
        radius: 10,
        color: '#a855f7',
        glowColor: 'rgba(168, 85, 247, 0.4)',
        data: item,
      });
      l.push({ sourceId: targetMissionId, targetId: `intel-${item.id}` });
    });

    nodesRef.current = n;
    linksRef.current = l;
  }, [missions, intel, directives]);

  // Main canvas animation loop (Physics + Tactical HUD rendering)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particleTime = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2 + panOffset.x;
      const cy = height / 2 + panOffset.y;

      ctx.clearRect(0, 0, width, height);
      particleTime += 0.02;
      sweepAngleRef.current = (sweepAngleRef.current + 0.015) % (Math.PI * 2);

      ctx.save();
      ctx.translate(panOffset.x, panOffset.y);
      ctx.scale(zoomLevel, zoomLevel);

      // 1. Radar Grid and Rings
      const maxR = Math.max(width, height) * 0.65;
      const ringSteps = [0.25, 0.5, 0.75, 1.0];

      ringSteps.forEach((step, idx) => {
        const r = maxR * step;
        ctx.beginPath();
        ctx.arc(cx - panOffset.x, cy - panOffset.y, r, 0, Math.PI * 2);
        ctx.strokeStyle = idx === 3 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 6]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Tactical Range text
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.fillText(`${Math.round(step * 500)} KM`, cx - panOffset.x + 8, cy - panOffset.y - r + 12);
      });

      // Crosshairs
      ctx.beginPath();
      ctx.moveTo(cx - panOffset.x - maxR, cy - panOffset.y);
      ctx.lineTo(cx - panOffset.x + maxR, cy - panOffset.y);
      ctx.moveTo(cx - panOffset.x, cy - panOffset.y - maxR);
      ctx.lineTo(cx - panOffset.x, cy - panOffset.y + maxR);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Rotating Radar Sweep Beam
      const sweepAngle = sweepAngleRef.current;
      const sweepGradient = ctx.createRadialGradient(
        cx - panOffset.x, cy - panOffset.y, 0,
        cx - panOffset.x, cy - panOffset.y, maxR
      );
      sweepGradient.addColorStop(0, 'rgba(16, 185, 129, 0.15)');
      sweepGradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx - panOffset.x, cy - panOffset.y);
      ctx.arc(cx - panOffset.x, cy - panOffset.y, maxR, sweepAngle - 0.25, sweepAngle);
      ctx.closePath();
      ctx.fillStyle = sweepGradient;
      ctx.fill();
      ctx.restore();

      // Physics Simulation Step (Gentle Spring Dampening)
      const nodes = nodesRef.current;
      const links = linksRef.current;

      if (radarMode === 'neural') {
        // Link attraction
        links.forEach((l) => {
          const s = nodes.find((n) => n.id === l.sourceId);
          const t = nodes.find((n) => n.id === l.targetId);
          if (!s || !t) return;
          const dx = t.x - s.x;
          const dy = t.y - s.y;
          const dist = Math.sqrt(dx * dy + dy * dy) || 1;
          const targetDist = s.type === 'commander' ? 140 : 90;
          const force = (dist - targetDist) * 0.003;
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;

          if (s !== draggingNodeRef.current && s.type !== 'commander') {
            s.vx += fx;
            s.vy += fy;
          }
          if (t !== draggingNodeRef.current) {
            t.vx -= fx;
            t.vy -= fy;
          }
        });

        // Node repulsion
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const a = nodes[i];
            const b = nodes[j];
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const distSq = dx * dx + dy * dy || 1;
            if (distSq < 20000) {
              const rep = 180 / distSq;
              const fx = dx * rep;
              const fy = dy * rep;
              if (a !== draggingNodeRef.current && a.type !== 'commander') {
                a.vx -= fx;
                a.vy -= fy;
              }
              if (b !== draggingNodeRef.current && b.type !== 'commander') {
                b.vx += fx;
                b.vy += fy;
              }
            }
          }
        }

        // Apply velocity with friction
        nodes.forEach((n) => {
          if (n === draggingNodeRef.current) return;
          if (n.type === 'commander') {
            n.x = cx - panOffset.x;
            n.y = cy - panOffset.y;
            return;
          }
          n.vx *= 0.85;
          n.vy *= 0.85;
          n.x += n.vx;
          n.y += n.vy;
        });
      }

      // Draw Links & Energy Particles
      links.forEach((l) => {
        const s = nodes.find((n) => n.id === l.sourceId);
        const t = nodes.find((n) => n.id === l.targetId);
        if (!s || !t) return;

        // Skip filtered
        if (filterType === 'missions' && s.type === 'intel' && t.type === 'intel') return;
        if (filterType === 'intel' && s.type === 'directive' && t.type === 'directive') return;

        // Link Line
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(t.x, t.y);
        ctx.strokeStyle = s.type === 'commander' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = s.type === 'commander' ? 1.5 : 1;
        ctx.stroke();

        // Pulsing Energy Packet
        const pProgress = (particleTime * 0.8 + (s.x % 10) * 0.1) % 1;
        const px = s.x + (t.x - s.x) * pProgress;
        const py = s.y + (t.y - s.y) * pProgress;

        ctx.beginPath();
        ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.shadowColor = s.glowColor;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Draw Nodes
      nodes.forEach((n) => {
        // Filter visibility
        if (filterType === 'missions' && n.type === 'intel') return;
        if (filterType === 'intel' && n.type === 'directive') return;

        const isHovered = selectedNode?.id === n.id;

        // Outer Glow Ring
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius + (isHovered ? 8 : 4), 0, Math.PI * 2);
        ctx.fillStyle = n.glowColor;
        ctx.fill();

        // Node Body
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#090d16';
        ctx.fill();
        ctx.lineWidth = isHovered ? 2.5 : 1.5;
        ctx.strokeStyle = n.color;
        ctx.stroke();

        // Inner Core Dot
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius * 0.45, 0, Math.PI * 2);
        ctx.fillStyle = n.color;
        ctx.shadowColor = n.color;
        ctx.shadowBlur = isHovered ? 12 : 5;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Label
        ctx.fillStyle = isHovered ? '#ffffff' : 'rgba(244, 246, 251, 0.85)';
        ctx.font = `${isHovered ? 'bold 11px' : '10px'} "Cairo", sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(n.label.length > 20 ? n.label.substring(0, 18) + '...' : n.label, n.x, n.y + n.radius + 14);

        if (n.subLabel && (isHovered || n.type === 'mission' || n.type === 'commander')) {
          ctx.fillStyle = 'rgba(154, 164, 191, 0.7)';
          ctx.font = '8px "JetBrains Mono", monospace';
          ctx.fillText(n.subLabel, n.x, n.y + n.radius + 24);
        }
      });

      ctx.restore();

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    // Resize canvas
    const handleResize = () => {
      if (!canvas || !containerRef.current) return;
      canvas.width = containerRef.current.clientWidth;
      canvas.height = containerRef.current.clientHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [panOffset, zoomLevel, radarMode, filterType, selectedNode]);

  // Mouse Interaction Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left - panOffset.x) / zoomLevel;
    const mouseY = (e.clientY - rect.top - panOffset.y) / zoomLevel;

    // Check hit node
    const hit = nodesRef.current.find((n) => {
      const dx = n.x - mouseX;
      const dy = n.y - mouseY;
      return Math.sqrt(dx * dx + dy * dy) <= n.radius + 6;
    });

    if (hit) {
      tacticalAudio.playBlip();
      draggingNodeRef.current = hit;
      setSelectedNode(hit);
    } else {
      isPanningRef.current = true;
      panStartRef.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();

    if (draggingNodeRef.current) {
      draggingNodeRef.current.x = (e.clientX - rect.left - panOffset.x) / zoomLevel;
      draggingNodeRef.current.y = (e.clientY - rect.top - panOffset.y) / zoomLevel;
      draggingNodeRef.current.vx = 0;
      draggingNodeRef.current.vy = 0;
    } else if (isPanningRef.current) {
      setPanOffset({
        x: e.clientX - panStartRef.current.x,
        y: e.clientY - panStartRef.current.y,
      });
    }
  };

  const handleMouseUp = () => {
    draggingNodeRef.current = null;
    isPanningRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    setZoomLevel((prev) => Math.min(2.5, Math.max(0.6, prev * zoomFactor)));
  };

  return (
    <div 
      ref={containerRef}
      className="flex flex-col h-full craft-surface rounded-xl overflow-hidden relative text-right border craft-border shadow-2xl"
    >
      {/* Top Telemetry Header HUD */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b craft-border bg-[#0a0e17]/90 backdrop-blur-md z-10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Radio className="h-4 w-4 animate-pulse-subtle" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-zinc-100 flex items-center gap-1.5">
                <span>رادار السيطرة المعرفي</span>
                <span className="text-[9px] font-telemetry px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/60 text-emerald-400">
                  GRAPHIFY LIVE
                </span>
              </h3>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-telemetry text-zinc-400">
              <span className="text-zinc-500">COORD:</span>
              <span className="text-emerald-400/90">31.5017° N, 34.4668° E</span>
              <span>•</span>
              <span>NODES: {nodesRef.current.length}</span>
            </div>
          </div>
        </div>

        {/* Tactical Mode & Controls */}
        <div className="flex items-center gap-1.5">
          {/* Filter Pills */}
          <div className="hidden sm:flex items-center rounded-lg bg-black/40 border craft-border p-0.5 text-[10px] font-telemetry">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2 py-0.5 rounded ${filterType === 'all' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              الكل
            </button>
            <button
              onClick={() => setFilterType('missions')}
              className={`px-2 py-0.5 rounded ${filterType === 'missions' ? 'bg-cyan-900/60 text-cyan-300' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              المشاريع
            </button>
            <button
              onClick={() => setFilterType('intel')}
              className={`px-2 py-0.5 rounded ${filterType === 'intel' ? 'bg-purple-900/60 text-purple-300' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              الاستخبارات
            </button>
          </div>

          {/* Mode Switcher */}
          <button
            onClick={() => {
              tacticalAudio.playBlip();
              setRadarMode((m) => (m === 'orbital' ? 'neural' : 'orbital'));
            }}
            className="p-1.5 rounded-lg bg-zinc-900/80 border craft-border text-zinc-400 hover:text-zinc-100 transition-colors"
            title={radarMode === 'neural' ? 'تحويل إلى الرادار المداري' : 'تحويل إلى الشبكة الفيزيائية'}
          >
            <Layers className="h-3.5 w-3.5" />
          </button>

          {/* Zoom Controls */}
          <button
            onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.15))}
            className="p-1.5 rounded-lg bg-zinc-900/80 border craft-border text-zinc-400 hover:text-zinc-100 transition-colors"
            title="تقريب"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.15))}
            className="p-1.5 rounded-lg bg-zinc-900/80 border craft-border text-zinc-400 hover:text-zinc-100 transition-colors"
            title="إبعاد"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={() => {
              tacticalAudio.playConfirm();
              setZoomLevel(1);
              setPanOffset({ x: 0, y: 0 });
              onTriggerGraphifyScan();
            }}
            className="p-1.5 rounded-lg bg-zinc-900/80 border craft-border text-zinc-400 hover:text-emerald-400 transition-colors"
            title="إعادة ضبط ومسح شبكي"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Main Interactive Canvas */}
      <div className="flex-1 relative bg-[#070a12] overflow-hidden cursor-grab active:cursor-grabbing">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
          className="w-full h-full block"
        />

        {/* Selected Node Tactical HUD Inspector Drawer */}
        {selectedNode && (
          <div className="absolute bottom-3 right-3 left-3 sm:left-auto sm:w-80 rounded-xl bg-[#0e1422]/95 border border-zinc-700/80 shadow-2xl p-3.5 backdrop-blur-md z-20 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span 
                  className="w-2.5 h-2.5 rounded-full" 
                  style={{ backgroundColor: selectedNode.color, boxShadow: `0 0 8px ${selectedNode.color}` }} 
                />
                <div>
                  <span className="text-[10px] font-telemetry uppercase text-zinc-400 block">
                    {selectedNode.type}
                  </span>
                  <h4 className="text-xs font-bold text-zinc-100">{selectedNode.label}</h4>
                </div>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-zinc-500 hover:text-zinc-200 p-1"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {selectedNode.subLabel && (
              <p className="text-[11px] text-zinc-400 mb-2.5 font-telemetry bg-black/30 p-1.5 rounded border craft-border">
                {selectedNode.subLabel}
              </p>
            )}

            {selectedNode.data?.description && (
              <p className="text-[11px] text-zinc-300 mb-3 leading-relaxed">
                {selectedNode.data.description}
              </p>
            )}

            {/* Quick Actions */}
            <div className="flex items-center gap-2 pt-2 border-t craft-border">
              {selectedNode.type === 'mission' && selectedNode.data && (
                <button
                  onClick={() => {
                    tacticalAudio.playConfirm();
                    onSelectMission?.(selectedNode.data);
                    setSelectedNode(null);
                  }}
                  className="flex-1 py-1.5 px-2.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-200 text-[11px] font-medium transition-all text-center"
                >
                  التركيز على المهمة في اللوحة
                </button>
              )}

              {selectedNode.type === 'intel' && selectedNode.data?.url && (
                <a
                  href={selectedNode.data.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-1.5 px-2.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-200 text-[11px] font-medium transition-all text-center flex items-center justify-center gap-1"
                >
                  <span>فتح الرابط الأصلي</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
        )}

        {/* Ambient Compass Corner Indicator */}
        <div className="absolute top-3 left-3 pointer-events-none opacity-40">
          <Crosshair className="h-8 w-8 text-emerald-500/60" />
        </div>
      </div>
    </div>
  );
};
