// ============================================================================
// AQLIYA AGENTIC OS — ACTIONABLE TOOL SUITE
// ============================================================================

import type { AgentToolDefinition, AgentExecutionContext, AgentToolResult } from '../types';
import { supabase, offlineStorage } from '../../supabase';

export const AGENT_TOOLS: Record<string, AgentToolDefinition> = {
  // 1. Record New Memory in Mind Vault
  record_commander_memory: {
    name: 'record_commander_memory',
    nameAr: 'توثيق حقيقة أو قرار في بنك الذاكرة',
    description: 'يحفظ معلومة، قراراً، عادة، أو درساً مستفاداً جديداً عن القائد محمد في Mind Vault.',
    category: 'memory',
    requiresApproval: false,
    execute: async (args, ctx): Promise<AgentToolResult> => {
      try {
        const { content, memory_type = 'fact', importance = 7, tags = ['agentic_os'] } = args;
        if (!content) return { success: false, summary: 'المحتوى مطلوب لحفظ الذاكرة' };

        ctx.dispatchTelemetry({
          agentRole: 'life_ops',
          level: 'tool_call',
          message: `جاري حفظ ذاكرة جديدة في Mind Vault: [${content}]`,
        });

        const newMem = {
          content,
          memory_type,
          context_tags: tags,
          importance: Number(importance),
          mission_id: args.mission_id || null,
        };

        const { data, error } = await (supabase.from('commander_memories') as any).insert(newMem).select().single();
        if (data && ctx.onStateMutation) {
          await ctx.onStateMutation('add_memory', data);
        }

        return {
          success: true,
          summary: `تم توثيق الذاكرة بنجاح في Mind Vault بأهمية ${importance}/10.`,
          data: data || newMem,
        };
      } catch (err: any) {
        return { success: false, summary: 'فشل في حفظ الذاكرة', error: err.message };
      }
    },
  },

  // 2. Create Mission / Task
  create_mission_objective: {
    name: 'create_mission_objective',
    nameAr: 'تأسيس مشروع أو مسار عملياتي جديد',
    description: 'ينشئ مشروعاً تكتيكياً جديداً في جدول المهمات missions.',
    category: 'missions',
    requiresApproval: true, // Needs Commander approval!
    execute: async (args, ctx): Promise<AgentToolResult> => {
      try {
        const { title, code, current_focus, next_ops, tags = [] } = args;
        if (!title || !code) return { success: false, summary: 'العنوان ورمز المشروع مطلوبان' };

        const newMission = {
          title,
          code,
          status: 'active',
          progress_percent: 10,
          current_focus: current_focus || 'تأسيس البنية التحتية للمشروع',
          next_ops: next_ops || 'مراجعة المتطلبات الهندسية',
          done_log: [`[${new Date().toLocaleDateString('ar-EG')}] تم تأسيس المشروع بواسطة أسطول وكلاء عقلية`],
          tags,
        };

        const { data } = await (supabase.from('missions') as any).insert(newMission).select().single();
        if (data && ctx.onStateMutation) {
          await ctx.onStateMutation('add_mission', data);
        }

        return {
          success: true,
          summary: `تم إنشاء المشروع بنجاح: [${code}] ${title}`,
          data: data || newMission,
        };
      } catch (err: any) {
        return { success: false, summary: 'فشل في إنشاء المشروع', error: err.message };
      }
    },
  },

  // 3. Update Mission Progress & Next Ops
  update_mission_progress: {
    name: 'update_mission_progress',
    nameAr: 'تحديث مسار ونسبة إنجاز المشروع',
    description: 'يحدث نسبة التقدم، الخطوة القادمة، أو سجل الإنجاز لمشروع قائم.',
    category: 'missions',
    requiresApproval: false,
    execute: async (args, ctx): Promise<AgentToolResult> => {
      try {
        const { mission_id, progress_percent, next_ops, done_entry } = args;
        const target = ctx.missions.find((m) => m.id === mission_id || m.code === mission_id);
        if (!target) return { success: false, summary: `لم يتم العثور على المشروع: ${mission_id}` };

        const updates: any = {};
        if (progress_percent !== undefined) updates.progress_percent = Number(progress_percent);
        if (next_ops) updates.next_ops = next_ops;
        if (done_entry) {
          const currentLogs = target.done_log || [];
          updates.done_log = [`[${new Date().toLocaleTimeString('en-US', { hour12: false })}] ${done_entry}`, ...currentLogs];
        }

        await (supabase.from('missions') as any).update(updates).eq('id', target.id);
        if (ctx.onStateMutation) {
          await ctx.onStateMutation('update_mission', { id: target.id, ...updates });
        }

        return {
          success: true,
          summary: `تم تحديث مشروع [${target.code}]: إنجاز ${updates.progress_percent ?? target.progress_percent}%`,
          data: updates,
        };
      } catch (err: any) {
        return { success: false, summary: 'فشل في تحديث المشروع', error: err.message };
      }
    },
  },

  // 4. Curate Intel Solution
  curate_intel_solution: {
    name: 'curate_intel_solution',
    nameAr: 'تصنيف وإيداع حل أو رابط في بنك الاستخبارات',
    description: 'يصنف رابط يوتيوب/إنستغرام/جيت هب ويربطه بالمشروع الملائم وملاحظات التنفيذ.',
    category: 'intel',
    requiresApproval: false,
    execute: async (args, ctx): Promise<AgentToolResult> => {
      try {
        const { title, url, platform = 'web', category = 'solution_reel', problem_solved, key_takeaways, mission_id } = args;
        if (!title || !url) return { success: false, summary: 'العنوان والرابط مطلوبان' };

        const newItem = {
          title,
          url,
          platform,
          category,
          problem_solved: problem_solved || 'حل تقني تم رصده بواسطة وكيل الاستخبارات',
          key_takeaways: key_takeaways || '',
          mission_id: mission_id || null,
          status: 'reviewed',
          tags: ['curated_by_ai'],
        };

        const { data } = await (supabase.from('intel_depot') as any).insert(newItem).select().single();
        if (data && ctx.onStateMutation) {
          await ctx.onStateMutation('add_intel', data);
        }

        return {
          success: true,
          summary: `تم إيداع الرابط الاستخباراتي بنجاح: ${title}`,
          data: data || newItem,
        };
      } catch (err: any) {
        return { success: false, summary: 'فشل في حفظ الرابط الاستخباراتي', error: err.message };
      }
    },
  },

  // 5. Dispatch Battle Log Milestone
  dispatch_battle_log: {
    name: 'dispatch_battle_log',
    nameAr: 'تدوين إنجاز أو محطة في سجل المعارك',
    description: 'يسجل إنجازاً تاريخياً أو حدثاً نظامياً في battle_logs.',
    category: 'logs',
    requiresApproval: false,
    execute: async (args, ctx): Promise<AgentToolResult> => {
      try {
        const { title, details, entry_type = 'system_event', mission_id } = args;
        if (!title) return { success: false, summary: 'عنوان الإنجاز مطلوب' };

        const newLog = {
          entry_type,
          title,
          details: details || null,
          mission_id: mission_id || null,
        };

        const { data } = await (supabase.from('battle_logs') as any).insert(newLog).select().single();
        if (data && ctx.onStateMutation) {
          await ctx.onStateMutation('add_log', data);
        }

        return {
          success: true,
          summary: `تم تدوين الإنجاز في سجل المعارك: ${title}`,
          data: data || newLog,
        };
      } catch (err: any) {
        return { success: false, summary: 'فشل في تدوين الإنجاز', error: err.message };
      }
    },
  },

  // 6. Request Commander Human Decision
  request_commander_decision: {
    name: 'request_commander_decision',
    nameAr: 'طلب حسم أو قرار استراتيجي من القائد',
    description: 'يوقف تنفيذ المهمة مؤقتاً ويعرض تفاصيل القرار المطلوب على القائد محمد للموافقة.',
    category: 'system',
    requiresApproval: true,
    execute: async (args, ctx): Promise<AgentToolResult> => {
      const { prompt, options = ['موافق', 'رفض'] } = args;
      return {
        success: true,
        summary: `تم تقديم القرار للقائد: ${prompt}`,
        data: { prompt, options },
      };
    },
  },
};
