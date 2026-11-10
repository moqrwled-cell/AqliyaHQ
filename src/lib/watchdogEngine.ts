import type { Mission, IntelItem, StrategicDirective, BattleLog, CommanderMemory, WatchdogAlert } from '../types';
import { OfflineSyncEngine } from './offline-security/offlineSyncEngine';
import { CryptoVaultEngine } from './offline-security/cryptoVaultEngine';

export function scanSystemWatchdog(params: {
  missions: Mission[];
  intel: IntelItem[];
  directives: StrategicDirective[];
  battleLogs: BattleLog[];
  memories: CommanderMemory[];
}): WatchdogAlert[] {
  const { missions, intel, directives, battleLogs } = params;
  const alerts: WatchdogAlert[] = [];
  const now = new Date().getTime();
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;

  // 0. Scan Offline Sync & Security Vault
  const syncStats = OfflineSyncEngine.getSyncStats();
  if (syncStats.conflictCount > 0) {
    alerts.push({
      id: 'alert-sync-conflicts',
      pillar: 'system_security',
      severity: 'critical',
      title: `تعارض في المزامنة غير المتصلة (${syncStats.conflictCount})`,
      reason: `توجد ${syncStats.conflictCount} عمليات بها تعارض بيانات تحتاج اعتماد فض التعارض من القائد.`,
      daysStale: 0,
      actionType: 'resolve_conflict',
      targetId: 'sync_conflicts',
    });
  }

  if (syncStats.failedCount > 0) {
    alerts.push({
      id: 'alert-sync-failed',
      pillar: 'system_security',
      severity: 'warning',
      title: `عمليات مزامنة معلقة تجاوزت المحاولات (${syncStats.failedCount})`,
      reason: `توجد ${syncStats.failedCount} عمليات فشلت مزامنتها محلياً بسبب انقطاع الاتصال أو رفض الخادم.`,
      daysStale: 0,
      actionType: 'resolve_conflict',
      targetId: 'sync_failed',
    });
  }

  const lockout = CryptoVaultEngine.getLockoutState();
  if (lockout.lockoutUntil && Date.now() < lockout.lockoutUntil) {
    const sec = Math.ceil((lockout.lockoutUntil - Date.now()) / 1000);
    alerts.unshift({
      id: 'alert-security-lockout',
      pillar: 'system_security',
      severity: 'critical',
      title: 'النظام في وضع القفل الأمني المشدد',
      reason: `تم رصد محاولات إدخال خاطئة متكررة وتم قفل رمز الدخول مؤقتاً لحماية الحسابات والمفاتيح (${sec} ثانية متبقية).`,
      daysStale: 0,
      actionType: 'open_chat',
      targetId: 'security',
    });
  }

  // 1. Scan Projects & Missions for Stagnation (> 48 hours without update)
  missions.forEach((m) => {
    if (m.status !== 'active') return;

    const lastUpdated = new Date(m.updated_at || m.created_at).getTime();
    const diffDays = Math.floor((now - lastUpdated) / ONE_DAY_MS);

    if (diffDays >= 2) {
      alerts.push({
        id: `alert-mission-${m.id}`,
        pillar: 'projects',
        severity: diffDays >= 4 ? 'critical' : 'warning',
        title: `مشروع راكد: [${m.code}] ${m.title}`,
        reason: `مرت ${diffDays} أيام منذ آخر تحديث أو توثيق إنجاز في هذا المشروع.`,
        daysStale: diffDays,
        actionType: 'open_mission',
        targetId: m.id,
        data: m,
      });
    }

    // Check if next_ops is empty or default
    if (!m.next_ops || m.next_ops.trim().length === 0) {
      alerts.push({
        id: `alert-nextops-${m.id}`,
        pillar: 'projects',
        severity: 'warning',
        title: `الخطوة القادمة غير محددة: [${m.code}]`,
        reason: `المشروع يفتقد لتحديد خطوة حاسمة قادمة (Next Ops) للتحرك الفوري.`,
        daysStale: 0,
        actionType: 'open_mission',
        targetId: m.id,
        data: m,
      });
    }
  });

  // 2. Scan Intel Depot for Unreviewed & Unimplemented Key Solutions
  intel.forEach((item) => {
    const itemDate = new Date(item.created_at).getTime();
    const diffDays = Math.floor((now - itemDate) / ONE_DAY_MS);

    if (item.category === 'solution_reel' && item.problem_solved && item.status === 'unreviewed' && diffDays >= 2) {
      alerts.push({
        id: `alert-intel-${item.id}`,
        pillar: 'intel',
        severity: 'info',
        title: `حل تقني مخزن غير مطبق: ${item.title}`,
        reason: `خزنت حلاً لحل مشكلة «${item.problem_solved.substring(0, 50)}...» منذ ${diffDays} أيام دون ربطه بمشروع أو تطبيقه.`,
        daysStale: diffDays,
        actionType: 'open_intel',
        targetId: item.id,
        data: item,
      });
    }
  });

  // 3. Scan Directives for Unlinked High-Level Objectives
  directives.forEach((d) => {
    // Check if any active mission connects or tags this directive
    const isServed = missions.some(
      (m) =>
        m.status === 'active' &&
        (m.description?.includes(d.title) || m.tags?.some((t) => d.title.includes(t)))
    );

    if (!isServed && d.status === 'in_progress') {
      alerts.push({
        id: `alert-dir-${d.id}`,
        pillar: 'directives',
        severity: 'warning',
        title: `هدف استراتيجي غير مخدوم: ${d.title}`,
        reason: `هذا الهدف في مسار التنفيذ ولكن لا توجد مهمة نشطة حالياً مخصصة لإنجازه على أرض الواقع.`,
        daysStale: 0,
        actionType: 'open_chat',
        targetId: d.id,
        data: d,
      });
    }
  });

  // 4. Scan Today's SITREP Daily Check
  const todayDateStr = new Date().toISOString().split('T')[0];
  const hasBriefToday = battleLogs.some(
    (log) => log.created_at.startsWith(todayDateStr) && (log.entry_type === 'daily_brief' || log.entry_type === 'debrief')
  );

  if (!hasBriefToday) {
    const currentHour = new Date().getHours();
    const isEvening = currentHour >= 17;
    alerts.unshift({
      id: `alert-sitrep-today`,
      pillar: 'life_routine',
      severity: 'critical',
      title: isEvening ? 'لم تقم بمساءلة المساء ومراجعة المعركة اليوم' : 'لم تنفذ إحاطة الصباح وموجز الموقف التكتيكي (SITREP)',
      reason: isEvening
        ? 'حان وقت توثيق ما حققته اليوم، وتفريغ دروس المعركة، وإراحة عقلك للغد.'
        : 'المستشار بحاجة لمعرفة مستوى طاقتك وأولويات اليوم والاطمئنان على خطتك.',
      daysStale: 0,
      actionType: 'open_chat',
      targetId: 'sitrep',
    });
  }

  return alerts;
}
