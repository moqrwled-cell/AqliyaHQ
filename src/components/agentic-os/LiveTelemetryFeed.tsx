import React, { useRef, useEffect } from 'react';
import { Terminal, Cpu, Radio, Shield, Zap } from 'lucide-react';
import type { TelemetryLogEntry, AgentRole } from '../../lib/agentic-os/types';

interface LiveTelemetryFeedProps {
  entries: TelemetryLogEntry[];
  totalTokens: number;
}

export const LiveTelemetryFeed: React.FC<LiveTelemetryFeedProps> = ({
  entries,
  totalTokens,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries]);

  const getRoleBadge = (role: AgentRole) => {
    switch (role) {
      case 'chief_of_staff':
        return { label: 'CHIEF-OF-STAFF', color: 'text-emerald-400 bg-emerald-950/50 border-emerald-800/60' };
      case 'intel_scout':
        return { label: 'INTEL-SCOUT', color: 'text-cyan-400 bg-cyan-950/50 border-cyan-800/60' };
      case 'systems_dev':
        return { label: 'SYSTEMS-DEV', color: 'text-purple-400 bg-purple-950/50 border-purple-800/60' };
      case 'watchdog_sentry':
        return { label: 'WATCHDOG', color: 'text-amber-400 bg-amber-950/50 border-amber-800/60' };
      case 'life_ops':
        return { label: 'LIFE-OPS', color: 'text-rose-400 bg-rose-950/50 border-rose-800/60' };
    }
  };

  const getLevelColor = (level: TelemetryLogEntry['level']) => {
    switch (level) {
      case 'thought':
        return 'text-zinc-300';
      case 'tool_call':
        return 'text-cyan-300 font-mono';
      case 'approval_request':
        return 'text-amber-300 font-bold';
      case 'success':
        return 'text-emerald-300 font-semibold';
      case 'warn':
        return 'text-amber-400';
      case 'error':
        return 'text-rose-400 font-bold';
      default:
        return 'text-zinc-400';
    }
  };

  return (
    <div className="flex flex-col h-full rounded-2xl border craft-border bg-[#08090d]/95 backdrop-blur-md overflow-hidden font-telemetry">
      {/* Header */}
      <div className="flex items-center justify-between border-b craft-border bg-zinc-950/80 px-3.5 py-2">
        <div className="flex items-center gap-2">
          <Terminal className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
          <span className="text-[11px] font-bold text-zinc-200">
            سجل تيار التيليميتري المباشر // LIVE AGENT STREAM
          </span>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-zinc-500">
          <span className="flex items-center gap-1">
            <Cpu className="h-3 w-3 text-cyan-400" />
            <span className="text-zinc-400">{totalTokens} TOKENS</span>
          </span>
          <span className="flex items-center gap-1">
            <Radio className="h-3 w-3 text-emerald-400 animate-ping" />
            <span className="text-emerald-400 font-bold">STREAM: ACTIVE</span>
          </span>
        </div>
      </div>

      {/* Terminal Body */}
      <div
        ref={scrollRef}
        className="flex-1 p-3 overflow-y-auto space-y-2 font-mono text-[11px] leading-relaxed select-text"
      >
        {entries.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-zinc-600 gap-2">
            <Terminal className="h-6 w-6 opacity-40" />
            <p className="text-xs">في انتظار إصدار أول توجيه استراتيجي لبدء تدفق الوكلاء...</p>
          </div>
        ) : (
          entries.map((entry) => {
            const badge = getRoleBadge(entry.agentRole);
            return (
              <div
                key={entry.id}
                className="flex items-start gap-2.5 p-1.5 rounded hover:bg-zinc-900/40 transition-colors border-l-2 border-transparent hover:border-zinc-700"
              >
                <span className="text-zinc-600 text-[9px] font-mono whitespace-nowrap pt-0.5">
                  {entry.timestamp}
                </span>

                <span
                  className={`text-[9px] font-bold px-1.5 py-0.2 rounded border whitespace-nowrap ${badge.color}`}
                >
                  {badge.label}
                </span>

                <span className={`flex-1 break-words ${getLevelColor(entry.level)}`}>
                  {entry.message}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
