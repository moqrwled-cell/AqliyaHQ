import type { Mission, IntelItem, StrategicDirective, BattleLog, CommanderMemory, WatchdogAlert } from '../types';

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
