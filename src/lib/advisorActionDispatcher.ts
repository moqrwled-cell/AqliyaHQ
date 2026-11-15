// ============================================================================
// MOHA AGENT — ADVISOR AUTONOMOUS ACTION DISPATCHER
// Gives the AI Advisor 100% Autonomous Control to modify any part of the App State
// ============================================================================

import { SleepTrackerEngine } from './sleepTrackerEngine';
import { LockscreenEngine, type TaskQuadrant } from './lockscreenEngine';
import { PersonalFocusEngine } from './personal-focus/personalFocusEngine';
import type { PlanMutation } from './personal-focus/types';
import type { Mission, IntelItem } from '../types';
import { offlineStorage, supabase } from './supabase';

export interface AdvisorActionPayload {
  action: 
    | 'set_period_focus'
    | 'mark_sleep'
    | 'mark_wake'
    | 'log_sleep'
    | 'update_discipline'
    | 'update_mission'
    | 'create_mission'
    | 'add_quadrant_task'
    | 'toggle_quadrant_task'
    | 'set_alarm'
    | 'update_calories'
    | 'update_meal'
    | 'update_workout'
    | 'delete_intel'
    | 'update_intel';
  data: Record<string, any>;
}

export interface AdvisorActionResult {
  success: boolean;
  action: string;
  summaryAr: string;
  details?: any;
}

export class AdvisorActionDispatcher {
  /**
   * Execute autonomous action requested by the Commander through the Advisor
   */
  public static execute(payload: AdvisorActionPayload): AdvisorActionResult {
    const { action, data } = payload;

    try {
      switch (action) {
        // 1. تعديل تركيز المرحلة / الفترة الحالية
        case 'set_period_focus': {
          const focusText = data.focus || data.target || '';
          const periodTitle = data.periodTitle || 'تركيز المرحلة الحالية';
          const deadline = data.deadline;
          if (!focusText) return { success: false, action, summaryAr: 'نص التركيز مطلوب' };

          LockscreenEngine.setPeriodFocus(focusText, periodTitle, deadline);
          return {
            success: true,
            action,
            summaryAr: `تم تثبيت تركيز المرحلة بنجاح: "${focusText}" وتحديث شاشة القفل.`,
          };
        }

        // 2. تسجيل نمت الآن
        case 'mark_sleep': {
          const res = SleepTrackerEngine.markSleepNow();
          return {
            success: true,
            action,
            summaryAr: `تم توثيق نومك الآن فوراً في الساعة (${res.sleepTime}). نم نوماً عميقاً يا بطل للاستشفاء! 🌙`,
          };
        }

        // 3. تسجيل صحيت الآن
        case 'mark_wake': {
          const record = SleepTrackerEngine.markWakeNow();
          const durationFormatted = record ? `${Math.floor(record.durationMinutes / 60)}h ${record.durationMinutes % 60}m` : '8h';
          return {
            success: true,
            action,
            summaryAr: `صباح النشاط والعزيمة! تم توثيق استيقاظك فوراً. مدة النوم: (${durationFormatted}) وتم تحديث مصفوفة النوم 2026. 🌅`,
            details: record,
          };
        }

        // 4. توثيق نوم مخصص
        case 'log_sleep': {
          const nowStr = new Date().toISOString().split('T')[0];
          const dateStr = data.dateStr || nowStr;
          const sleepTime = data.sleepTime || '23:30';
          const wakeTime = data.wakeTime || '07:30';
          const rating = data.qualityRating || 4;

          const rec = SleepTrackerEngine.logSleep(dateStr, sleepTime, wakeTime, rating, data.notes || '');
          const durationFormatted = `${Math.floor(rec.durationMinutes / 60)}h ${rec.durationMinutes % 60}m`;
          return {
            success: true,
            action,
            summaryAr: `تم تسجيل نوم تاريخ ${dateStr} بنجاح: من ${sleepTime} إلى ${wakeTime} (${durationFormatted}).`,
            details: rec,
          };
        }

        // 5. تعديل داش دروب (لوحة الانضباط، الوزن، السعرات، الستريك)
        case 'update_discipline': {
          const { currentWeight, targetWeight, calories, streakDays } = data;

          if (currentWeight) {
            PersonalFocusEngine.updateCalories(calories || 3000, currentWeight);
          }

          // Update discipline logs in localStorage
          try {
            const raw = localStorage.getItem('moha_discipline_month_logs_v1');
            if (raw) {
              const logs = JSON.parse(raw);
              const todayDay = new Date().getDate();
              const todayLog = logs.find((l: any) => l.day === todayDay);
              if (todayLog) {
                if (data.workoutDone !== undefined) todayLog.workoutDone = Boolean(data.workoutDone);
                if (data.caloriesDone !== undefined) todayLog.caloriesDone = Boolean(data.caloriesDone);
                if (data.nexusDone !== undefined) todayLog.nexusDone = Boolean(data.nexusDone);
                todayLog.score = 95;
                localStorage.setItem('moha_discipline_month_logs_v1', JSON.stringify(logs));
              }
            }
          } catch (e) {}

          window.dispatchEvent(new CustomEvent('moha:discipline-updated', { detail: data }));
          return {
            success: true,
            action,
            summaryAr: `تم تحديث لوحة الانضباط (داش دروب): ${currentWeight ? `الوزن ${currentWeight} كجم` : ''} ${calories ? `السعرات ${calories} سعرة` : ''} بنجاح.`,
          };
        }

        // 6. تعديل المشاريع
        case 'update_mission': {
          const { codeOrId, current_focus, next_ops, progress_percent, title } = data;
          let missions: Mission[] = [];
          try {
            const raw = localStorage.getItem('moha_missions');
            if (raw) missions = JSON.parse(raw);
          } catch (e) {}

          const target = missions.find(
            (m) =>
              m.id === codeOrId ||
              m.code?.toLowerCase() === codeOrId?.toLowerCase() ||
              m.title?.includes(codeOrId)
          );

          if (target) {
            if (current_focus) target.current_focus = current_focus;
            if (next_ops) target.next_ops = next_ops;
            if (progress_percent !== undefined) target.progress_percent = Number(progress_percent);
            if (title) target.title = title;
            target.updated_at = new Date().toISOString();

            localStorage.setItem('moha_missions', JSON.stringify(missions));
            window.dispatchEvent(new CustomEvent('moha:missions-updated', { detail: missions }));

            return {
              success: true,
              action,
              summaryAr: `تم تعديل مشروع [${target.code}] ${target.title}: ${current_focus ? `التركيز الحالي: "${current_focus}"` : ''} (نسبة الإنجاز: ${target.progress_percent}%).`,
            };
          }

          return { success: false, action, summaryAr: `لم يتم العثور على المشروع المحدد: "${codeOrId}"` };
        }

        // 7. إنشاء مشروع جديد
        case 'create_mission': {
          let missions: Mission[] = [];
          try {
            const raw = localStorage.getItem('moha_missions');
            if (raw) missions = JSON.parse(raw);
          } catch (e) {}

          const newMission: Mission = {
            id: `mission-${Date.now()}`,
            code: data.code || `PRJ-${missions.length + 1}`,
            title: data.title || 'مشروع جديد',
            description: data.description || '',
            current_focus: data.current_focus || '',
            next_ops: data.next_ops || '',
            progress_percent: data.progress_percent || 10,
            status: 'active',
            done_log: [],
            github_repo: null,
            tags: data.tags || ['strategic'],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          missions.push(newMission);
          localStorage.setItem('moha_missions', JSON.stringify(missions));
          window.dispatchEvent(new CustomEvent('moha:missions-updated', { detail: missions }));

          return {
            success: true,
            action,
            summaryAr: `تم إنشاء المشروع الجديد [${newMission.code}] ${newMission.title} وتثبيته في لوحة المشاريع.`,
          };
        }

        // 8. إضافة مهمة في مصفوفة شاشة القفل (الأرباع الأربعة)
        case 'add_quadrant_task': {
          const q: TaskQuadrant = data.quadrant || 'urgent_important';
          const task = LockscreenEngine.addTask({
            quadrant: q,
            title: data.title,
            time: data.time,
            dateStr: data.dateStr,
            color: q === 'urgent_important' ? '#f97316' : q === 'important' ? '#3b82f6' : q === 'urgent' ? '#eab308' : '#a1a1aa',
          });

          const qLabel = q === 'urgent_important' ? '🔥 مهم وعاجل' : q === 'important' ? '🟦 مهم' : q === 'urgent' ? '⚡ عاجل' : '≡ يوماً ما';
          return {
            success: true,
            action,
            summaryAr: `تمت إضافة المهمة إلى قسم [${qLabel}] في شاشة القفل: "${task.title}".`,
          };
        }

        // 9. إنجاز مهمة في شاشة القفل
        case 'toggle_quadrant_task': {
          const tasks = LockscreenEngine.getTasks();
          let target = tasks.find((t) => t.id === data.id);
          if (!target && data.titleKeyword) {
            target = tasks.find((t) => t.title.toLowerCase().includes(data.titleKeyword.toLowerCase()));
          }

          if (target) {
            LockscreenEngine.toggleTask(target.id);
            return {
              success: true,
              action,
              summaryAr: `تم ${target.completed ? 'إلغاء إنجاز' : 'إنجاز'} المهمة بنجاح: "${target.title}".`,
            };
          }
          return { success: false, action, summaryAr: 'لم يتم العثور على المهمة في مصفوفة شاشة القفل.' };
        }

        // 10. ضبط منبه
        case 'set_alarm': {
          const time = data.time || '06:00';
          const label = data.label || 'استيقاظ ونشاط';
          // Dispatch to window alarm listener
          window.dispatchEvent(new CustomEvent('moha:set-alarm-request', { detail: { time, label, tone: data.tone || 'military' } }));
          return {
            success: true,
            action,
            summaryAr: `تم ضبط المنبه التكتيكي فوراً على الساعة (${time}) بعنوان: "${label}".`,
          };
        }

        // 11. تفويض وتعديل السعرات والوجبات
        case 'update_calories':
        case 'update_meal':
        case 'update_workout': {
          const res = PersonalFocusEngine.applyMutation(payload as PlanMutation);
          return {
            success: res.success,
            action,
            summaryAr: res.message,
          };
        }

        // 12. حذف رابط من الاستخبارات
        case 'delete_intel': {
          const id = data.id;
          const query = (data.query || data.title || '').toLowerCase().trim();
          const items = offlineStorage.get<IntelItem[]>('intel', []);
          const target = id 
            ? items.find((i) => i.id === id)
            : items.find((i) => i.title.toLowerCase().includes(query) || i.url.toLowerCase().includes(query));

          if (!target) {
            return { success: false, action, summaryAr: 'لم يتم العثور على الرابط المطلوب حذفه من الاستخبارات.' };
          }

          const filtered = items.filter((i) => i.id !== target.id);
          offlineStorage.save('intel', filtered);
          window.dispatchEvent(new CustomEvent('moha:intel-updated', { detail: { type: 'delete', id: target.id } }));

          try {
            supabase.from('intel_depot').delete().eq('id', target.id);
          } catch (e) {
            offlineStorage.queueSyncAction({ table: 'intel_depot', type: 'delete', data: { id: target.id } });
          }

          return {
            success: true,
            action,
            summaryAr: `تم حذف الرابط بنجاح: "${target.title}".`,
          };
        }

        // 13. تعديل رابط في الاستخبارات
        case 'update_intel': {
          const id = data.id;
          const query = (data.query || data.titleSearch || '').toLowerCase().trim();
          const items = offlineStorage.get<IntelItem[]>('intel', []);
          const target = id
            ? items.find((i) => i.id === id)
            : items.find((i) => i.title.toLowerCase().includes(query) || i.url.toLowerCase().includes(query));

          if (!target) {
            return { success: false, action, summaryAr: 'لم يتم العثور على الرابط المطلوب تعديله في الاستخبارات.' };
          }

          const updated: IntelItem = {
            ...target,
            title: data.title || target.title,
            category: data.category || target.category,
            problem_solved: data.problem_solved !== undefined ? data.problem_solved : target.problem_solved,
            key_takeaways: data.key_takeaways !== undefined ? data.key_takeaways : target.key_takeaways,
            status: data.status || target.status,
            tags: data.tags || target.tags,
            updated_at: new Date().toISOString(),
          };

          const nextList = items.map((i) => (i.id === target.id ? updated : i));
          offlineStorage.save('intel', nextList);
          window.dispatchEvent(new CustomEvent('moha:intel-updated', { detail: { type: 'update', updated } }));

          try {
            (supabase.from('intel_depot') as any).update(updated).eq('id', target.id);
          } catch (e) {
            offlineStorage.queueSyncAction({ table: 'intel_depot', type: 'update', data: updated });
          }

          return {
            success: true,
            action,
            summaryAr: `تم تحديث بيانات الرابط بنجاح: "${updated.title}".`,
          };
        }

        default:
          return { success: false, action, summaryAr: `إجراء غير مدعوم: ${action}` };
      }
    } catch (err: any) {
      console.warn('Advisor Action Dispatcher Execution Error:', err);
      return { success: false, action, summaryAr: `فشل تنفيذ الإجراء: ${err.message}` };
    }
  }
}
