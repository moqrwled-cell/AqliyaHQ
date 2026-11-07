import type { Mission, StrategicDirective, IntelItem, BattleLog, CommanderMemory } from '../types';

export function exportObsidianMarkdown(data: {
  missions: Mission[];
  directives: StrategicDirective[];
  intel: IntelItem[];
  logs: BattleLog[];
  memories: CommanderMemory[];
}) {
  let combinedMarkdown = `# عقلية | AQLIYA HQ — أرشيف القيادة الشامل
> تاريخ التصدير: ${new Date().toLocaleString('ar-SA')} | صيغة Obsidian متوافقة 100%

---

## 🎯 الأهداف والاستراتيجيات الكبرى (Strategic Directives)
`;

  data.directives.forEach((d) => {
    combinedMarkdown += `
### 📌 ${d.title}
- **الحالة:** \`${d.status}\` | **المحور:** \`${d.pillar}\`
- **التاريخ المستهدف:** ${d.target_date || 'غير محدد'}
- **الملاحظات:** ${d.notes || 'لا توجد ملاحظات'}
`;
  });

  combinedMarkdown += `\n---\n\n## 🚀 المهمات والمشاريع (Missions & Ops)\n`;
  data.missions.forEach((m) => {
    combinedMarkdown += `
### ⚡ [${m.code}] ${m.title}
- **الحالة:** \`${m.status}\` | **نسبة الإنجاز:** \`${m.progress_percent}%\`
- **التركيز الحالي:** ${m.current_focus || 'غير محدد'}
- **الخطوة القادمة:** ${m.next_ops || 'غير محدد'}
- **المستودع:** \`${m.github_repo || 'لا يوجد'}\`
- **سجل ما تم إنجازه:**
${Array.isArray(m.done_log) && m.done_log.length > 0 ? m.done_log.map((log) => `  - [x] ${log}`).join('\n') : '  - لا توجد عناصر مسجلة بعد'}
`;
  });

  combinedMarkdown += `\n---\n\n## 🧠 بنك الاستخبارات والحلول (Intel Depot)\n`;
  data.intel.forEach((item) => {
    combinedMarkdown += `
### 💡 ${item.title}
- **الرابط:** [اضغط للمشاهدة](${item.url})
- **النوع:** \`${item.category}\` | **المنصة:** \`${item.platform}\` | **الحالة:** \`${item.status}\`
- **الحل المستفاد:** ${item.problem_solved || 'غير مدون'}
- **الخطوات المستخلصة:** ${item.key_takeaways || 'غير مدونة'}
- **الوسوم:** ${item.tags?.map((t) => `#${t}`).join(' ') || '#عام'}
`;
  });

  combinedMarkdown += `\n---\n\n## ⚔️ سجل المعركة والتحديثات (Battle Log)\n`;
  data.logs.forEach((log) => {
    combinedMarkdown += `
- **[${new Date(log.created_at).toLocaleDateString('ar-SA')}]** \`${log.entry_type}\`: **${log.title}**
  ${log.details ? `> ${log.details}` : ''}
`;
  });

  // Download Trigger
  const blob = new Blob([combinedMarkdown], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Aqliya_Obsidian_Vault_${new Date().toISOString().split('T')[0]}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportPureJSON(data: any) {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Aqliya_Database_Backup_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
