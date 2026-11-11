export type MissionStatus = 'active' | 'standby' | 'completed' | 'archived';

export interface Mission {
  id: string;
  title: string;
  code: string;
  description: string | null;
  status: MissionStatus;
  progress_percent: number;
  current_focus: string | null;
  next_ops: string | null;
  done_log: string[];
  github_repo: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface StrategicDirective {
  id: string;
  title: string;
  pillar: 'vision' | 'technical' | 'financial' | 'operational';
  target_date: string | null;
  status: 'draft' | 'in_progress' | 'achieved' | 'postponed';
  notes: string | null;
  created_at: string;
}

export type IntelCategory = 
  | 'watch_later' 
  | 'solution_reel' 
  | 'article' 
  | 'reference'
  | 'tech'
  | 'educational'
  | 'business'
  | 'fitness'
  | 'mindset'
  | 'entertainment'
  | 'general';
export type IntelPlatform = 'youtube' | 'instagram' | 'tiktok' | 'twitter' | 'github' | 'web';
export type IntelStatus = 'unreviewed' | 'reviewed' | 'implemented';

export interface IntelItem {
  id: string;
  title: string;
  url: string;
  category: IntelCategory;
  platform: IntelPlatform;
  problem_solved: string | null;
  key_takeaways: string | null;
  mission_id: string | null;
  tags: string[];
  status: IntelStatus;
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface CommanderDossier {
  id: string;
  callsign: string;
  vision_statement: string | null;
  core_skills: string[];
  life_history_summary: string | null;
  decision_principles: string[];
  active_focus: string | null;
  updated_at: string;
}

export interface CommanderMemory {
  id: string;
  memory_type: 'fact' | 'decision' | 'preference' | 'lesson_learned' | 'episode';
  content: string;
  context_tags: string[];
  importance: number;
  mission_id: string | null;
  created_at: string;
}

export interface BattleLog {
  id: string;
  entry_type: 'git_commit' | 'daily_brief' | 'debrief' | 'manual_milestone' | 'system_event';
  title: string;
  details: string | null;
  mission_id: string | null;
  created_at: string;
}

export interface NetworkNode {
  id: string;
  label: string;
  node_type: 'mission' | 'directive' | 'intel' | 'solution' | 'concept';
  metadata: Record<string, any>;
  x?: number;
  y?: number;
}

export interface NetworkEdge {
  id: string;
  source_id: string;
  target_id: string;
  relationship: string;
  weight: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  audio_url?: string | null;
  created_at: string;
}

export interface WatchdogAlert {
  id: string;
  pillar: 'projects' | 'intel' | 'directives' | 'life_routine' | 'system_security';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  reason: string;
  daysStale: number;
  actionType: 'open_mission' | 'open_intel' | 'open_chat' | 'dismiss' | 'resolve_conflict';
  targetId?: string;
  data?: any;
}

export interface LifeRoutineCheck {
  id: string;
  energyLevel: 'high' | 'medium' | 'low';
  dailyFocus: string;
  discoveryAnswer?: string;
  discoveryQuestion?: string;
  completedAt: string;
}
