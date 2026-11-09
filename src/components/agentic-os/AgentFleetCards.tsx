import React from 'react';
import { 
  Bot, 
  Compass, 
  Code2, 
  ShieldAlert, 
  HeartPulse, 
  Cpu, 
  Radio, 
  Activity,
  Layers
} from 'lucide-react';
import type { AgentRole } from '../../lib/agentic-os/types';
import { AGENT_FLEET } from '../../lib/agentic-os/agentRegistry';

interface AgentFleetCardsProps {
  agentStatuses: Record<AgentRole, { status: string; currentTask?: string }>;
  activeSwarmCount: number;
}

export const AgentFleetCards: React.FC<AgentFleetCardsProps> = ({
  agentStatuses,
  activeSwarmCount,
}) => {
  const getIcon = (role: AgentRole) => {
    switch (role) {
      case 'chief_of_staff':
        return Bot;
      case 'intel_scout':
        return Compass;
      case 'systems_dev':
        return Code2;
      case 'watchdog_sentry':
        return ShieldAlert;
      case 'life_ops':
        return HeartPulse;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'executing':
        return 'text-cyan-400 bg-cyan-950/60 border-cyan-800 animate-pulse';
      case 'planning':
        return 'text-emerald-400 bg-emerald-950/60 border-emerald-800 animate-pulse';
      case 'waiting_approval':
        return 'text-amber-400 bg-amber-950/60 border-amber-800 animate-bounce';
      case 'completed':
        return 'text-emerald-400 bg-emerald-950/40 border-emerald-900';
      case 'error':
        return 'text-rose-400 bg-rose-950/60 border-rose-800';
      default:
        return 'text-zinc-500 bg-zinc-900/60 border-zinc-800';
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
      {(Object.keys(AGENT_FLEET) as AgentRole[]).map((role) => {
        const agent = AGENT_FLEET[role];
        const IconComponent = getIcon(role);
        const state = agentStatuses[role] || { status: 'idle' };
        const isBusy = state.status === 'executing' || state.status === 'planning';

        return (
          <div
            key={role}
            className={`relative rounded-xl border p-3 flex flex-col justify-between transition-all backdrop-blur-md ${
              isBusy
                ? `${agent.accentBorder} bg-zinc-900/90`
                : state.status === 'waiting_approval'
                ? 'border-amber-500/80 bg-amber-950/30 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                : 'border-zinc-800/80 bg-zinc-950/60 hover:border-zinc-700'
            }`}
          >
            {/* Top row: Icon & Status */}
            <div className="flex items-center justify-between mb-2">
              <span
                className={`text-[9px] font-telemetry uppercase px-1.5 py-0.2 rounded border font-bold ${getStatusColor(
                  state.status
                )}`}
              >
                {state.status}
              </span>

              <div
                className={`h-7 w-7 rounded-lg flex items-center justify-center border ${
                  role === 'chief_of_staff'
                    ? 'bg-emerald-950/50 border-emerald-800 text-emerald-400'
                    : role === 'intel_scout'
                    ? 'bg-cyan-950/50 border-cyan-800 text-cyan-400'
                    : role === 'systems_dev'
                    ? 'bg-purple-950/50 border-purple-800 text-purple-400'
                    : role === 'watchdog_sentry'
                    ? 'bg-amber-950/50 border-amber-800 text-amber-400'
                    : 'bg-rose-950/50 border-rose-800 text-rose-400'
                }`}
              >
                <IconComponent className="h-4 w-4" />
              </div>
            </div>

            {/* Agent Name & Role */}
            <div className="text-right">
              <h4 className="text-xs font-bold text-zinc-100">{agent.nameAr}</h4>
              <p className="text-[10px] text-zinc-400 line-clamp-1 mt-0.5">
                {state.currentTask || agent.roleDescription}
              </p>
            </div>

            {/* Pulse Indicator */}
            <div className="mt-2.5 pt-1.5 border-t border-zinc-800/60 flex items-center justify-between text-[9px] font-telemetry text-zinc-500">
              <span className="flex items-center gap-1">
                <Activity className={`h-2.5 w-2.5 ${isBusy ? 'text-cyan-400 animate-spin' : 'text-zinc-600'}`} />
                <span>{isBusy ? 'ACTIVE' : 'READY'}</span>
              </span>
              <span className="text-zinc-400 font-mono text-[9px]">{agent.name}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
