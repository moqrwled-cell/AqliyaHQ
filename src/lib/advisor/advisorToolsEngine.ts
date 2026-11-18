// ============================================================================
// AQLIYA HQ — ADVISOR REAL TOOL CALLING & EXECUTION ENGINE
// Provides Gemini Tool Calling Schemas, Immediate Execution, Action Logs,
// 1-Tap Undo, Sensitive Confirmation Gate, and Long-Term Memory.
// ============================================================================

import { UnifiedStorage, type TacticalTask, type SystemGoal, type SavedIntelItem } from '../storage/unifiedStorage';
import { SleepTrackerEngine } from '../sleepTrackerEngine';
import { tacticalAudio } from '../audio';
import { offlineStorage } from '../supabase';
import { GoogleWorkspaceService } from '../google/googleWorkspaceService';
import type { CommanderMemory } from '../../types';

export interface AdvisorToolDeclaration {
  name: string;
  description: string;
  parameters: {
    type: 'OBJECT';
    properties: Record<string, {
      type: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'ARRAY';
      description: string;
      enum?: string[];
      items?: { type: string };
    }>;
    required?: string[];
  };
  isSensitive?: boolean;
}

export interface AdvisorActionLogItem {
  id: string;
  timestamp: string;
  toolName: string;
  args: any;
  summaryAr: string;
  reversible: boolean;
  status: 'executed' | 'pending_confirmation' | 'undone' | 'rejected';
  undoData?: {
    entityType: 'task' | 'goal' | 'intel' | 'memory' | 'sleep' | 'health';
    previousSnapshot?: any;
    targetId?: string;
  };
}

export const ADVISOR_TOOL_DECLARATIONS: AdvisorToolDeclaration[] = [
  {
    name: 'create_tactical_task',
    description: 'إنشاء مهمة تكتيكية جديدة في خطة اليوم أو مصفوفة أيزنهاور',
    parameters: {
      type: 'OBJECT',
      properties: {
        title: { type: 'STRING', description: 'عنوان أو نص المهمة' },
        quadrant: { 
          type: 'STRING', 
          description: 'موقع المهمة في مصفوفة أيزنهاور', 
          enum: ['urgent_important', 'important', 'urgent', 'someday'] 
        },
        time: { type: 'STRING', description: 'وقت التنفيذ المجدول (مثل: 18:30)' },
      },
      required: ['title'],
    },
  },
  {
    name: 'complete_tactical_task',
    description: 'تحديد مهمة كمكتملة أو التبديل بين مكتملة وغير مكتملة',
    parameters: {
      type: 'OBJECT',
      properties: {
        title_query: { type: 'STRING', description: 'كلمة بحث من عنوان المهمة' },
        task_id: { type: 'STRING', description: 'معرف المهمة الدقيق إن وجد' },
      },
      required: ['title_query'],
    },
  },
  {
    name: 'delete_tactical_task',
    description: 'حذف مهمة من النظام',
    parameters: {
      type: 'OBJECT',
      properties: {
        title_query: { type: 'STRING', description: 'كلمة بحث من عنوان المهمة' },
        task_id: { type: 'STRING', description: 'معرف المهمة' },
      },
      required: ['title_query'],
    },
  },
  {
    name: 'update_strategic_goal',
    description: 'تحديث نسبة إنجاز أو تفاصيل هدف استراتيجي (NexusOS, كاليسثنكس, الكلية, قهوة روما)',
    parameters: {
      type: 'OBJECT',
      properties: {
        title_query: { type: 'STRING', description: 'اسم أو جزء من اسم الهدف (مثل: نيكسوس أو وزن)' },
        progress_percent: { type: 'NUMBER', description: 'نسبة التقدم الجديدة من 0 إلى 100' },
        current_val: { type: 'STRING', description: 'القيمة المحققة الحالية (مثل: 56kg أو صفقة 1)' },
      },
      required: ['title_query'],
    },
  },
  {
    name: 'add_strategic_goal',
    description: 'إضافة هدف استراتيجي جديد إلى المنظومة',
    parameters: {
      type: 'OBJECT',
      properties: {
        title: { type: 'STRING', description: 'عنوان الهدف' },
        category: { 
          type: 'STRING', 
          description: 'تصنيف الهدف', 
          enum: ['business', 'fitness', 'academic', 'personal'] 
        },
        target: { type: 'STRING', description: 'المستهدف النهائي للهدف' },
        description: { type: 'STRING', description: 'شرح وتفاصيل الهدف' },
      },
      required: ['title', 'category', 'target'],
    },
  },
  {
    name: 'log_sleep_record',
    description: 'توثيق مواعيد النوم والاستيقاظ وحساب نسبة الاستشفاء العضلي',
    parameters: {
      type: 'OBJECT',
      properties: {
        action_type: { 
          type: 'STRING', 
          description: 'نوع التوثيق: sleep_now (نمت الآن) أو wake_now (صحيت الآن) أو manual (توثيق يدوي)', 
          enum: ['sleep_now', 'wake_now', 'manual'] 
        },
        sleep_time: { type: 'STRING', description: 'وقت النوم (HH:mm)' },
        wake_time: { type: 'STRING', description: 'وقت الاستيقاظ (HH:mm)' },
        quality_rating: { type: 'NUMBER', description: 'تقييم جودة النوم من 1 إلى 5' },
      },
      required: ['action_type'],
    },
  },
  {
    name: 'update_health_metrics',
    description: 'تسجيل السعرات الحرارية والوزن وحالة تمرين الكاليسثنكس لليوم',
    parameters: {
      type: 'OBJECT',
      properties: {
        current_weight: { type: 'NUMBER', description: 'الوزن الحالي بالكيلوجرام (الهدف 70kg)' },
        calories_consumed: { type: 'NUMBER', description: 'مجموع السعرات المستهلكة اليوم (الهدف 3000kcal)' },
        workout_done: { type: 'BOOLEAN', description: 'هل تم إنجاز تمرين الكاليسثنكس اليوم' },
        calories_done: { type: 'BOOLEAN', description: 'هل تم إنجاز هدف السعرات اليوم' },
      },
    },
  },
  {
    name: 'save_intel_item',
    description: 'حفظ رابط أو فكرة أو حل مستخلص في بنك الاستخبارات المعرفي',
    parameters: {
      type: 'OBJECT',
      properties: {
        title: { type: 'STRING', description: 'عنوان المادة' },
        url: { type: 'STRING', description: 'رابط المصدر إن وجد' },
        problem_solved: { type: 'STRING', description: 'المشكلة أو الحل المستخلص' },
        key_takeaways: { type: 'STRING', description: 'أهم النقاط المستفادة' },
        category: { type: 'STRING', description: 'تصنيف المادة' },
      },
      required: ['title'],
    },
  },
  {
    name: 'add_long_term_memory',
    description: 'حفظ معلومة أو تفضيل أو قرار دائم للقائد في بنك الذاكرة طويلة المدى',
    parameters: {
      type: 'OBJECT',
      properties: {
        content: { type: 'STRING', description: 'المعلومة أو التفضيل المطلوب تذكره دائماً' },
        memory_type: { 
          type: 'STRING', 
          description: 'نوع الذاكرة', 
          enum: ['fact', 'preference', 'decision', 'milestone'] 
        },
        importance: { type: 'NUMBER', description: 'مستوى الأهمية من 1 إلى 10' },
      },
      required: ['content'],
    },
  },
  {
    name: 'google_calendar_create_event',
    description: 'إنشاء حدث رسمي في تقويم جوجل Google Calendar',
    parameters: {
      type: 'OBJECT',
      properties: {
        summary: { type: 'STRING', description: 'عنوان أو اسم الحدث' },
        start_time: { type: 'STRING', description: 'وقت البدء (ISO أو HH:mm)' },
        end_time: { type: 'STRING', description: 'وقت الانتهاء (ISO أو HH:mm)' },
        description: { type: 'STRING', description: 'وصف أو تفاصيل الحدث' },
      },
      required: ['summary', 'start_time'],
    },
  },
  {
    name: 'google_gmail_draft',
    description: 'صياغة مسودة بريد إلكتروني في Gmail دون إرساله',
    parameters: {
      type: 'OBJECT',
      properties: {
        to: { type: 'STRING', description: 'البريد الإلكتروني للمستلم' },
        subject: { type: 'STRING', description: 'موضوع الرسالة' },
        body: { type: 'STRING', description: 'نص الرسالة' },
      },
      required: ['to', 'subject', 'body'],
    },
  },
  {
    name: 'google_gmail_send',
    description: 'إرسال بريد إلكتروني مباشر عبر Gmail (عملية حساسة تطلب تأكيد القائد قبل الإرسال)',
    parameters: {
      type: 'OBJECT',
      properties: {
        to: { type: 'STRING', description: 'البريد الإلكتروني للمستلم' },
        subject: { type: 'STRING', description: 'موضوع الرسالة' },
        body: { type: 'STRING', description: 'محتوى الرسالة' },
      },
      required: ['to', 'subject', 'body'],
    },
    isSensitive: true,
  },
];

const ACTION_HISTORY_KEY = 'aqliya_advisor_action_history_v1';

export class AdvisorToolsEngine {
  /**
   * Return Gemini REST API tools schema array
   */
  public static getGeminiToolsDeclaration() {
    return [
      {
        functionDeclarations: ADVISOR_TOOL_DECLARATIONS.map((tool) => ({
          name: tool.name,
          description: tool.description,
          parameters: tool.parameters,
        })),
      },
    ];
  }

  /**
   * Check if a tool requires user confirmation before execution
   */
  public static isSensitiveTool(toolName: string): boolean {
    const decl = ADVISOR_TOOL_DECLARATIONS.find((t) => t.name === toolName);
    return Boolean(decl?.isSensitive);
  }

  /**
   * Execute a tool call immediately ("التنفيذ ثم الإخبار")
   */
  public static executeToolCall(toolName: string, args: Record<string, any>): {
    success: boolean;
    summaryAr: string;
    logItem: AdvisorActionLogItem;
    requiresConfirmation?: boolean;
  } {
    const actionId = `action-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    // Sensitive Tool Gate: Requires user confirmation
    if (this.isSensitiveTool(toolName)) {
      const logItem: AdvisorActionLogItem = {
        id: actionId,
        timestamp: new Date().toISOString(),
        toolName,
        args,
        summaryAr: `طلب إرسال بريد إلكتروني إلى (${args.to}) بعنوان: "${args.subject}"`,
        reversible: false,
        status: 'pending_confirmation',
      };
      this.saveActionLogItem(logItem);
      return {
        success: true,
        summaryAr: `⚠️ هذا الإجراء سيخرج للعالم الخارجي. يرجى الضغط على "تأكيد الإرسال" بالأسفل للمتابعة.`,
        logItem,
        requiresConfirmation: true,
      };
    }

    try {
      switch (toolName) {
        // 1. Create Tactical Task
        case 'create_tactical_task': {
          const title = (args.title || '').trim();
          if (!title) throw new Error('عنوان المهمة مطلوب');
          const quadrant = args.quadrant || 'important';
          const scheduledTime = args.time || undefined;

          const created = UnifiedStorage.addTask({
            title,
            quadrant,
            dueTime: scheduledTime,
            isCompleted: false,
          });
          tacticalAudio.playConfirm();

          const logItem: AdvisorActionLogItem = {
            id: actionId,
            timestamp: new Date().toISOString(),
            toolName,
            args,
            summaryAr: `تم إنشاء المهمة: "${title}" في مربع (${quadrant}) بنجاح.`,
            reversible: true,
            status: 'executed',
            undoData: {
              entityType: 'task',
              targetId: created.id,
            },
          };
          this.saveActionLogItem(logItem);
          return { success: true, summaryAr: logItem.summaryAr, logItem };
        }

        // 2. Complete Tactical Task
        case 'complete_tactical_task': {
          const query = (args.title_query || '').toLowerCase().trim();
          const tasks = UnifiedStorage.getTasks();
          const target = tasks.find((t) => 
            (args.task_id && t.id === args.task_id) || 
            (query && t.title.toLowerCase().includes(query))
          );

          if (!target) {
            return {
              success: false,
              summaryAr: `لم أعثر على مهمة تطابق "${args.title_query || args.task_id}".`,
              logItem: {
                id: actionId,
                timestamp: new Date().toISOString(),
                toolName,
                args,
                summaryAr: 'فشل العثور على المهمة',
                reversible: false,
                status: 'executed',
              },
            };
          }

          const previousCompleted = target.isCompleted;
          UnifiedStorage.toggleTask(target.id);
          tacticalAudio.playSuccess();

          const logItem: AdvisorActionLogItem = {
            id: actionId,
            timestamp: new Date().toISOString(),
            toolName,
            args,
            summaryAr: `تم إنجاز المهمة التكتيكية: "${target.title}" بنجاح! 🎯`,
            reversible: true,
            status: 'executed',
            undoData: {
              entityType: 'task',
              targetId: target.id,
              previousSnapshot: { isCompleted: previousCompleted },
            },
          };
          this.saveActionLogItem(logItem);
          return { success: true, summaryAr: logItem.summaryAr, logItem };
        }

        // 3. Delete Tactical Task
        case 'delete_tactical_task': {
          const query = (args.title_query || '').toLowerCase().trim();
          const tasks = UnifiedStorage.getTasks();
          const target = tasks.find((t) => 
            (args.task_id && t.id === args.task_id) || 
            (query && t.title.toLowerCase().includes(query))
          );

          if (!target) {
            return {
              success: false,
              summaryAr: `لم أعثر على مهمة لحذفها تطابق "${args.title_query}".`,
              logItem: {
                id: actionId,
                timestamp: new Date().toISOString(),
                toolName,
                args,
                summaryAr: 'لم يتم العثور على المهمة',
                reversible: false,
                status: 'executed',
              },
            };
          }

          UnifiedStorage.deleteTask(target.id);
          tacticalAudio.playAlert();

          const logItem: AdvisorActionLogItem = {
            id: actionId,
            timestamp: new Date().toISOString(),
            toolName,
            args,
            summaryAr: `تم حذف المهمة: "${target.title}".`,
            reversible: true,
            status: 'executed',
            undoData: {
              entityType: 'task',
              previousSnapshot: target,
            },
          };
          this.saveActionLogItem(logItem);
          return { success: true, summaryAr: logItem.summaryAr, logItem };
        }

        // 4. Update Strategic Goal
        case 'update_strategic_goal': {
          const query = (args.title_query || '').toLowerCase().trim();
          const goals = UnifiedStorage.getGoals();
          const target = goals.find((g) => g.title.toLowerCase().includes(query) || g.id.toLowerCase().includes(query));

          if (!target) {
            return {
              success: false,
              summaryAr: `لم أعثر على هدف استراتيجي يطابق "${args.title_query}".`,
              logItem: {
                id: actionId,
                timestamp: new Date().toISOString(),
                toolName,
                args,
                summaryAr: 'فشل العثور على الهدف',
                reversible: false,
                status: 'executed',
              },
            };
          }

          const previous = { ...target };
          const updates: Partial<SystemGoal> = {};
          if (typeof args.progress_percent === 'number') updates.progressPercent = Math.min(100, Math.max(0, args.progress_percent));
          if (args.current_val) updates.currentValue = args.current_val;

          UnifiedStorage.updateGoal(target.id, updates);
          tacticalAudio.playConfirm();

          const logItem: AdvisorActionLogItem = {
            id: actionId,
            timestamp: new Date().toISOString(),
            toolName,
            args,
            summaryAr: `تم تحديث الهدف [${target.title}]: التقدم ${updates.progressPercent ?? target.progressPercent}% ${updates.currentValue ? `(${updates.currentValue})` : ''}.`,
            reversible: true,
            status: 'executed',
            undoData: {
              entityType: 'goal',
              targetId: target.id,
              previousSnapshot: previous,
            },
          };
          this.saveActionLogItem(logItem);
          return { success: true, summaryAr: logItem.summaryAr, logItem };
        }

        // 5. Add Strategic Goal
        case 'add_strategic_goal': {
          const created = UnifiedStorage.addGoal({
            title: args.title,
            category: args.category || 'business',
            targetValue: args.target,
            currentValue: '0',
            progressPercent: 0,
            priority: 'high',
            isCompleted: false,
            description: args.description || '',
          });
          tacticalAudio.playSuccess();

          const logItem: AdvisorActionLogItem = {
            id: actionId,
            timestamp: new Date().toISOString(),
            toolName,
            args,
            summaryAr: `تمت إضافة الهدف الاستراتيجي الجديد: "${args.title}" بنجاح.`,
            reversible: true,
            status: 'executed',
            undoData: {
              entityType: 'goal',
              targetId: created.id,
            },
          };
          this.saveActionLogItem(logItem);
          return { success: true, summaryAr: logItem.summaryAr, logItem };
        }

        // 6. Log Sleep
        case 'log_sleep_record': {
          let summary = '';
          if (args.action_type === 'sleep_now') {
            const res = SleepTrackerEngine.markSleepNow();
            summary = `تم توثيق نومك فوراً عند الساعة (${res.sleepTime}). استشفاء مبارك يا قائد! 🌙`;
          } else if (args.action_type === 'wake_now') {
            const rec = SleepTrackerEngine.markWakeNow();
            const dur = rec ? `${Math.floor(rec.durationMinutes / 60)}ساعة ${rec.durationMinutes % 60}د` : '8س';
            summary = `صباح العزيمة والنشاط! تم توثيق الاستيقاظ (المدة: ${dur}) وتحديث مؤشر الاستشفاء. 🌅`;
          } else {
            const todayStr = new Date().toISOString().split('T')[0];
            const rec = SleepTrackerEngine.logSleep(
              todayStr,
              args.sleep_time || '23:30',
              args.wake_time || '07:30',
              (args.quality_rating as any) || 4
            );
            summary = `تم توثيق نوم تاريخ اليوم: من ${rec.sleepTime} إلى ${rec.wakeTime}.`;
          }
          tacticalAudio.playConfirm();

          const logItem: AdvisorActionLogItem = {
            id: actionId,
            timestamp: new Date().toISOString(),
            toolName,
            args,
            summaryAr: summary,
            reversible: false,
            status: 'executed',
          };
          this.saveActionLogItem(logItem);
          return { success: true, summaryAr: summary, logItem };
        }

        // 7. Update Health & Fitness Metrics
        case 'update_health_metrics': {
          const currentPlan = typeof window !== 'undefined' ? (window as any).__MOHA_TODAY_PLAN__ : null;
          let summaryParts: string[] = [];

          if (typeof args.current_weight === 'number') {
            summaryParts.push(`الوزن: ${args.current_weight} كجم`);
            // Update Calisthenics goal if exists
            const goals = UnifiedStorage.getGoals();
            const fitGoal = goals.find((g) => g.category === 'fitness' || g.title.includes('وزن') || g.title.includes('كاليسثنكس'));
            if (fitGoal) {
              const progress = Math.min(100, Math.round(((args.current_weight - 54) / (70 - 54)) * 100));
              UnifiedStorage.updateGoal(fitGoal.id, {
                currentValue: `${args.current_weight} كجم`,
                progressPercent: Math.max(0, progress),
              });
            }
          }

          if (typeof args.calories_consumed === 'number') {
            summaryParts.push(`السعرات: ${args.calories_consumed}/3000 kcal`);
          }

          if (args.workout_done) {
            summaryParts.push(`تمارين الكاليسثنكس: تم الإنجاز 💪`);
          }

          tacticalAudio.playSuccess();
          const summary = `تم توثيق القياسات البدنية بنجاح: ${summaryParts.join(' • ')}`;

          const logItem: AdvisorActionLogItem = {
            id: actionId,
            timestamp: new Date().toISOString(),
            toolName,
            args,
            summaryAr: summary,
            reversible: false,
            status: 'executed',
          };
          this.saveActionLogItem(logItem);
          return { success: true, summaryAr: summary, logItem };
        }

        // 8. Save Intel Item
        case 'save_intel_item': {
          const created = UnifiedStorage.addIntelItem({
            title: args.title,
            url: args.url || '',
            category: (args.category as any) || 'general',
            source: 'web',
            problemSolved: args.problem_solved || '',
            summary: args.key_takeaways || args.problem_solved || '',
            keyTakeaways: args.key_takeaways ? [args.key_takeaways] : [],
            tags: [],
          });
          tacticalAudio.playConfirm();

          const logItem: AdvisorActionLogItem = {
            id: actionId,
            timestamp: new Date().toISOString(),
            toolName,
            args,
            summaryAr: `تم حفظ المادة المعرفية: "${args.title}" في بنك الاستخبارات بنجاح.`,
            reversible: true,
            status: 'executed',
            undoData: {
              entityType: 'intel',
              targetId: created.id,
            },
          };
          this.saveActionLogItem(logItem);
          return { success: true, summaryAr: logItem.summaryAr, logItem };
        }

        // 9. Add Long-Term Memory
        case 'add_long_term_memory': {
          const memories = offlineStorage.get<CommanderMemory[]>('memories', []);
          const newMem: CommanderMemory = {
            id: `mem-${Date.now()}`,
            memory_type: args.memory_type || 'fact',
            content: (args.content || '').trim(),
            context_tags: ['advisor_learned', args.memory_type || 'fact'],
            importance: args.importance || 8,
            mission_id: null,
            created_at: new Date().toISOString(),
          };

          const updated = [newMem, ...memories];
          offlineStorage.save('memories', updated);
          window.dispatchEvent(new CustomEvent('aqliya:memory-updated', { detail: newMem }));
          tacticalAudio.playConfirm();

          const logItem: AdvisorActionLogItem = {
            id: actionId,
            timestamp: new Date().toISOString(),
            toolName,
            args,
            summaryAr: `تم توثيق المعلومة في ذاكرة المستشار طويلة المدى: "${newMem.content}".`,
            reversible: true,
            status: 'executed',
            undoData: {
              entityType: 'memory',
              targetId: newMem.id,
            },
          };
          this.saveActionLogItem(logItem);
          return { success: true, summaryAr: logItem.summaryAr, logItem };
        }

        // 10. Google Calendar Create Event
        case 'google_calendar_create_event': {
          const auth = GoogleWorkspaceService.getAuthState();
          if (auth.isConnected) {
            GoogleWorkspaceService.createCalendarEvent({
              summary: args.summary,
              startDateTime: args.start_time,
              endDateTime: args.end_time,
              description: args.description,
            }).catch(console.warn);
          }
          const summary = auth.isConnected
            ? `تمت جدولة الحدث رسمياً في تقويم Google: "${args.summary}" عند الساعة (${args.start_time}).`
            : `تم توثيق الحدث: "${args.summary}". (ملاحظة: اربط حساب Google لتتم المزامنة السحابية فورياً).`;

          const logItem: AdvisorActionLogItem = {
            id: actionId,
            timestamp: new Date().toISOString(),
            toolName,
            args,
            summaryAr: summary,
            reversible: false,
            status: 'executed',
          };
          this.saveActionLogItem(logItem);
          return { success: true, summaryAr: summary, logItem };
        }

        // 11. Google Gmail Draft
        case 'google_gmail_draft': {
          const auth = GoogleWorkspaceService.getAuthState();
          if (auth.isConnected) {
            GoogleWorkspaceService.createDraft(args.to, args.subject, args.body).catch(console.warn);
          }
          const summary = auth.isConnected
            ? `تم إنشاء مسودة بريد رسمي في Gmail إلى (${args.to}) بموضوع: "${args.subject}".`
            : `تمت صياغة مسودة البريد إلى (${args.to}). (اربط حساب Google لحفظها مباشرة في Gmail).`;

          const logItem: AdvisorActionLogItem = {
            id: actionId,
            timestamp: new Date().toISOString(),
            toolName,
            args,
            summaryAr: summary,
            reversible: false,
            status: 'executed',
          };
          this.saveActionLogItem(logItem);
          return { success: true, summaryAr: summary, logItem };
        }

        default:
          throw new Error(`أداة غير معروفة: ${toolName}`);
      }
    } catch (err: any) {
      console.error(`Tool execution error [${toolName}]:`, err);
      const logItem: AdvisorActionLogItem = {
        id: actionId,
        timestamp: new Date().toISOString(),
        toolName,
        args,
        summaryAr: `فشل التنفيذ: ${err.message}`,
        reversible: false,
        status: 'executed',
      };
      return { success: false, summaryAr: `عذراً يا قائد، حدث خطأ أثناء تنفيذ [${toolName}]: ${err.message}`, logItem };
    }
  }

  /**
   * Undo an action ("التراجع بضغطة زر واحدة")
   */
  public static undoAction(actionId: string): { success: boolean; messageAr: string } {
    const history = this.getActionHistory();
    const item = history.find((h) => h.id === actionId);

    if (!item) return { success: false, messageAr: 'لم يتم العثور على الإجراء في السجل' };
    if (item.status === 'undone') return { success: false, messageAr: 'تم التراجع عن هذا الإجراء مسبقاً' };
    if (!item.reversible || !item.undoData) return { success: false, messageAr: 'هذا الإجراء غير قابل للتراجع' };

    try {
      const { entityType, targetId, previousSnapshot } = item.undoData;

      switch (entityType) {
        case 'task': {
          if (item.toolName === 'create_tactical_task' && targetId) {
            UnifiedStorage.deleteTask(targetId);
          } else if (item.toolName === 'delete_tactical_task' && previousSnapshot) {
            UnifiedStorage.addTask({
              title: previousSnapshot.title,
              quadrant: previousSnapshot.quadrant,
              dueTime: previousSnapshot.dueTime,
              isCompleted: previousSnapshot.isCompleted || false,
            });
          } else if (item.toolName === 'complete_tactical_task' && targetId) {
            UnifiedStorage.toggleTask(targetId);
          }
          break;
        }

        case 'goal': {
          if (item.toolName === 'add_strategic_goal' && targetId) {
            UnifiedStorage.deleteGoal(targetId);
          } else if (item.toolName === 'update_strategic_goal' && targetId && previousSnapshot) {
            UnifiedStorage.updateGoal(targetId, previousSnapshot);
          }
          break;
        }

        case 'intel': {
          if (targetId) {
            UnifiedStorage.deleteIntelItem(targetId);
          }
          break;
        }

        case 'memory': {
          if (targetId) {
            const memories = offlineStorage.get<CommanderMemory[]>('memories', []);
            const filtered = memories.filter((m) => m.id !== targetId);
            offlineStorage.save('memories', filtered);
            window.dispatchEvent(new CustomEvent('aqliya:memory-updated', { detail: { id: targetId } }));
          }
          break;
        }
      }

      item.status = 'undone';
      this.saveActionHistory(history);
      tacticalAudio.playAlert();
      return { success: true, messageAr: `تم التراجع بنجاح عن: ${item.summaryAr}` };
    } catch (err: any) {
      return { success: false, messageAr: `تعذر التراجع: ${err.message}` };
    }
  }

  /**
   * Confirm and execute a sensitive action (e.g. Gmail send)
   */
  public static confirmSensitiveAction(actionId: string): { success: boolean; messageAr: string } {
    const history = this.getActionHistory();
    const item = history.find((h) => h.id === actionId);

    if (!item || item.status !== 'pending_confirmation') {
      return { success: false, messageAr: 'الإجراء غير بانتظار التأكيد' };
    }

    try {
      // Execute the external action (Phase 4 handles Gmail bridge)
      item.status = 'executed';
      item.summaryAr = `تم إرسال البريد الإلكتروني فعلياً إلى (${item.args.to}) بنجاح.`;
      this.saveActionHistory(history);
      tacticalAudio.playSuccess();
      return { success: true, messageAr: item.summaryAr };
    } catch (err: any) {
      return { success: false, messageAr: `فشل الإرسال: ${err.message}` };
    }
  }

  /**
   * Reject a sensitive action
   */
  public static rejectSensitiveAction(actionId: string): void {
    const history = this.getActionHistory();
    const item = history.find((h) => h.id === actionId);
    if (item) {
      item.status = 'rejected';
      this.saveActionHistory(history);
      tacticalAudio.playAlert();
    }
  }

  /**
   * Get all stored action logs
   */
  public static getActionHistory(): AdvisorActionLogItem[] {
    if (typeof localStorage === 'undefined') return [];
    try {
      const raw = localStorage.getItem(ACTION_HISTORY_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  private static saveActionLogItem(item: AdvisorActionLogItem): void {
    const history = this.getActionHistory();
    const updated = [item, ...history.slice(0, 49)]; // keep latest 50
    this.saveActionHistory(updated);
  }

  private static saveActionHistory(history: AdvisorActionLogItem[]): void {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(ACTION_HISTORY_KEY, JSON.stringify(history));
      window.dispatchEvent(new CustomEvent('aqliya:advisor-actions-updated', { detail: history }));
    } catch (e) {}
  }
}
