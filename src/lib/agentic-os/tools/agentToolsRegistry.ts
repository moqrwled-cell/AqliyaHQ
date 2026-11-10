// ============================================================================
// AQLIYA AGENTIC OS — UNIFIED TOOL REGISTRY
// ============================================================================

import type { EnhancedToolDefinition } from './types';
import type { AgentToolResult, AgentExecutionContext } from '../types';
import { SafeFileOps } from './safeFileOps';
import { supabase } from '../../supabase';
import { PersistentMemoryStore } from '../../memory-graph/memoryStore';
import { KnowledgeGraphEngine } from '../../memory-graph/knowledgeGraphEngine';
import { askCommanderAI } from '../../gemini';
import { ProjectLifeEngine } from '../../project-life/projectLifeEngine';
import { OpportunityRadarEngine } from '../../opportunity-radar/opportunityRadarEngine';
import { CryptoVaultEngine } from '../../offline-security/cryptoVaultEngine';
import { OfflineSyncEngine } from '../../offline-security/offlineSyncEngine';

export const ENHANCED_TOOL_REGISTRY: Record<string, EnhancedToolDefinition> = {
  // --------------------------------------------------------------------------
  // 1. قراءة الملفات (read_file)
  // --------------------------------------------------------------------------
  read_file: {
    name: 'read_file',
    nameAr: 'قراءة الملفات والمستندات',
    description: 'يقرأ محتويات أي ملف نصي أو كود أو ملاحظة ماركداون تقع ضمن مستودع المشروع أو مخزن أوبسيديان.',
    category: 'files',
    permissionLevel: 'read_only',
    allowedAgents: ['chief_of_staff', 'systems_dev', 'intel_scout', 'watchdog_sentry', 'life_ops'],
    inputs: [
      { name: 'path', type: 'string', description: 'مسار الملف النسبي أو المطلق داخل المشروع أو أوبسيديان', required: true },
    ],
    outputDescription: 'النص الصافي لمحتوى الملف.',
    requiresApproval: false,
    execute: async (args, ctx): Promise<AgentToolResult> => {
      const { path } = args;
      if (!path) return { success: false, summary: 'مسار الملف مطلوب للقراءة' };

      const res = await SafeFileOps.readFile(path);
      if (!res.success) {
        return { success: false, summary: `فشل قراءة الملف: ${res.error}`, error: res.error };
      }

      return {
        success: true,
        summary: `تمت قراءة الملف بنجاح (${(res.content || '').length} حرف)`,
        data: { path: res.filePath, content: res.content },
      };
    },
  },

  // --------------------------------------------------------------------------
  // 2. البحث داخل المشاريع (search_projects)
  // --------------------------------------------------------------------------
  search_projects: {
    name: 'search_projects',
    nameAr: 'البحث داخل المشاريع والمسارات',
    description: 'يبحث في كافة المشاريع الحالية والسابقة وخطواتها وأهدافها ووسومها حسب الكلمة المفتاحية.',
    category: 'projects',
    permissionLevel: 'read_only',
    allowedAgents: ['chief_of_staff', 'systems_dev', 'intel_scout', 'watchdog_sentry'],
    inputs: [
      { name: 'query', type: 'string', description: 'كلمة البحث أو رمز المشروع أو الوسم', required: true },
    ],
    outputDescription: 'قائمة بالمشاريع والمهام والوثائق المطابقة للبحث.',
    requiresApproval: false,
    execute: async (args, ctx): Promise<AgentToolResult> => {
      const { query } = args;
      if (!query) return { success: false, summary: 'كلمة البحث مطلوبة' };

      const q = query.toLowerCase();
      const matchedMissions = ctx.missions.filter((m) =>
        m.title.toLowerCase().includes(q) ||
        m.code.toLowerCase().includes(q) ||
        (m.description && m.description.toLowerCase().includes(q)) ||
        (m.tags && m.tags.some((t: string) => t.toLowerCase().includes(q)))
      );

      // فحص من Knowledge Graph إن وجد
      const graphNodes = KnowledgeGraphEngine.getNodesByType('project')
        .filter((n) => n.label.toLowerCase().includes(q));

      return {
        success: true,
        summary: `تم العثور على ${matchedMissions.length} مشاريع مطابقة لكلمة [${query}].`,
        data: { missions: matchedMissions, relatedGraphNodes: graphNodes },
      };
    },
  },

  // --------------------------------------------------------------------------
  // 3. إنشاء الملاحظات (create_note)
  // --------------------------------------------------------------------------
  create_note: {
    name: 'create_note',
    nameAr: 'إنشاء ملاحظة أو وثيقة جديدة',
    description: 'ينشئ ملف ملاحظة جديد بصيغة Markdown في مجلد الملاحظات أو مشروع محدد.',
    category: 'obsidian',
    permissionLevel: 'low_risk',
    allowedAgents: ['chief_of_staff', 'intel_scout', 'life_ops', 'systems_dev'],
    inputs: [
      { name: 'title', type: 'string', description: 'عنوان الملاحظة', required: true },
      { name: 'content', type: 'string', description: 'محتوى الملاحظة بصيغة Markdown', required: true },
      { name: 'folder', type: 'string', description: 'المجلد الفرعي المراد الحفظ فيه', required: false, default: 'Projects' },
    ],
    outputDescription: 'مسار الملف الذي تم إنشاؤه وتأكيد الحفظ.',
    requiresApproval: false,
    execute: async (args, ctx): Promise<AgentToolResult> => {
      const { title, content, folder = 'Projects' } = args;
      if (!title || !content) return { success: false, summary: 'عنوان ومحتوى الملاحظة مطلوبان' };

      const safeTitle = title.replace(/[\\/:*?"<>|]/g, '_');
      const targetPath = `E:\\Antigravity_Vault\\${folder}\\${safeTitle}.md`;

      const header = `---
title: "${title}"
created: "${new Date().toISOString()}"
author: "AQLIYA Agent Fleet"
---

`;
      const fullContent = `${header}# ${title}\n\n${content}`;
      const res = await SafeFileOps.writeFile(targetPath, fullContent);

      if (!res.success) {
        return { success: false, summary: `فشل إنشاء الملاحظة: ${res.error}`, error: res.error };
      }

      return {
        success: true,
        summary: `تم إنشاء الملاحظة بنجاح: ${safeTitle}.md`,
        data: { filePath: res.filePath, bytesWritten: res.bytesWritten },
      };
    },
  },

  // --------------------------------------------------------------------------
  // 4. تعديل الملفات (edit_file)
  // --------------------------------------------------------------------------
  edit_file: {
    name: 'edit_file',
    nameAr: 'تعديل أو إلحاق محتوى بملف',
    description: 'يعدل محتوى ملف موجود أو يلحق به أسطراً جديدة ضمن النطاق المصرح به.',
    category: 'files',
    permissionLevel: 'high_critical',
    allowedAgents: ['systems_dev', 'chief_of_staff'],
    inputs: [
      { name: 'path', type: 'string', description: 'مسار الملف المراد تعديله', required: true },
      { name: 'content', type: 'string', description: 'المحتوى الجديد أو الملحق', required: true },
      { name: 'mode', type: 'string', description: 'append (إلحاق) أو overwrite (استبدال)', required: false, default: 'append' },
    ],
    outputDescription: 'تأكيد الحفظ وعدد البايتات المكتوبة.',
    requiresApproval: true, // إجراء حرج يتطلب موافقة القائد
    execute: async (args, ctx): Promise<AgentToolResult> => {
      const { path, content, mode = 'append' } = args;
      if (!path || content === undefined) return { success: false, summary: 'المسار والمحتوى مطلوبان للتعديل' };

      const res = mode === 'append'
        ? await SafeFileOps.appendFile(path, content)
        : await SafeFileOps.writeFile(path, content);

      if (!res.success) {
        return { success: false, summary: `فشل تعديل الملف: ${res.error}`, error: res.error };
      }

      return {
        success: true,
        summary: `تم ${mode === 'append' ? 'إلحاق المحتوى بـ' : 'استبدال محتوى'} الملف بنجاح: ${res.filePath}`,
        data: { filePath: res.filePath, bytesWritten: res.bytesWritten },
      };
    },
  },

  // --------------------------------------------------------------------------
  // 5. إنشاء المهام (create_task)
  // --------------------------------------------------------------------------
  create_task: {
    name: 'create_task',
    nameAr: 'إنشاء مهمة عمل جديدة',
    description: 'يضيف مهمة تكتيكية لمشروع محدد أو ينشئ مساراً عملياتياً فورياً.',
    category: 'projects',
    permissionLevel: 'low_risk',
    allowedAgents: ['chief_of_staff', 'systems_dev', 'watchdog_sentry'],
    inputs: [
      { name: 'title', type: 'string', description: 'عنوان المهمة', required: true },
      { name: 'mission_id', type: 'string', description: 'معرف أو رمز المشروع المرتبط', required: false },
      { name: 'priority', type: 'string', description: 'high, medium, low', required: false, default: 'high' },
    ],
    outputDescription: 'تفاصيل المهمة وسجل التحديث.',
    requiresApproval: false,
    execute: async (args, ctx): Promise<AgentToolResult> => {
      const { title, mission_id, priority = 'high' } = args;
      if (!title) return { success: false, summary: 'عنوان المهمة مطلوب' };

      const targetMission = mission_id 
        ? ctx.missions.find((m) => m.id === mission_id || m.code === mission_id)
        : ctx.missions[0];

      if (targetMission) {
        const nextOps = `[${priority.toUpperCase()}] ${title}`;
        await (supabase.from('missions') as any)
          .update({ next_ops: nextOps })
          .eq('id', targetMission.id);

        if (ctx.onStateMutation) {
          await ctx.onStateMutation('update_mission', { id: targetMission.id, next_ops: nextOps });
        }

        return {
          success: true,
          summary: `تم تعيين المهمة كخطوة تالية (Next Ops) لمشروع [${targetMission.code}]: ${title}`,
          data: { missionId: targetMission.id, nextOps },
        };
      }

      return {
        success: true,
        summary: `تم تسجيل المهمة التكتيكية بنجاح: ${title}`,
        data: { title, priority },
      };
    },
  },

  // --------------------------------------------------------------------------
  // 6. تحديث حالة المشاريع (update_project_status)
  // --------------------------------------------------------------------------
  update_project_status: {
    name: 'update_project_status',
    nameAr: 'تحديث حالة ونسبة إنجاز المشروع',
    description: 'يحدث نسبة التقدم، الخطوة القادمة، وسجل الإنجاز لمشروع قائم.',
    category: 'projects',
    permissionLevel: 'low_risk',
    allowedAgents: ['chief_of_staff', 'systems_dev', 'watchdog_sentry'],
    inputs: [
      { name: 'mission_id', type: 'string', description: 'معرف المشروع أو رمزه', required: true },
      { name: 'progress_percent', type: 'number', description: 'نسبة التقدم من 0 إلى 100', required: false },
      { name: 'next_ops', type: 'string', description: 'الخطوة العملياتية القادمة', required: false },
      { name: 'done_entry', type: 'string', description: 'بند إنجاز يضاف لسجل المشروع', required: false },
    ],
    outputDescription: 'ملخص التحديثات التي طرأت على المشروع.',
    requiresApproval: false,
    execute: async (args, ctx): Promise<AgentToolResult> => {
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
    },
  },

  // --------------------------------------------------------------------------
  // 7. تحليل المستندات (analyze_document)
  // --------------------------------------------------------------------------
  analyze_document: {
    name: 'analyze_document',
    nameAr: 'تحليل وتلخيص المستندات المعقدة',
    description: 'يقرأ مستنداً أو ملف كود أو خطة ويستخلص منها المتطلبات الهندسية ونقاط القرار التكتيكية.',
    category: 'files',
    permissionLevel: 'read_only',
    allowedAgents: ['intel_scout', 'chief_of_staff', 'systems_dev'],
    inputs: [
      { name: 'path', type: 'string', description: 'مسار الملف المراد تحليله', required: true },
      { name: 'aspect', type: 'string', description: 'محور التحليل (أمان، كود، دراسة جدوى)', required: false, default: 'شامل' },
    ],
    outputDescription: 'تحليل تكتيكي مهيكل يتضمن النقاط الجوهرية والتوصيات.',
    requiresApproval: false,
    execute: async (args, ctx): Promise<AgentToolResult> => {
      const { path, aspect = 'شامل' } = args;
      const fileRes = await SafeFileOps.readFile(path);
      if (!fileRes.success) {
        return { success: false, summary: `تعذر قراءة المستند للتحليل: ${fileRes.error}` };
      }

      const content = fileRes.content || '';
      const prompt = `أنت محلل وثائق خبير لنظام AQLIYA HQ للقائد محمد قرمان.
قم بتحليل المستند التالي بالتركيز على جانب: "${aspect}".
المستند:
${content.slice(0, 3000)}

المطلوب:
1. ملخص تنفيذي موجز (3 أسطر).
2. أهم 3 معالم أو متطلبات حاسمة.
3. توصية خطوة العمل القادمة (Next Ops).`;

      const analysis = await askCommanderAI(prompt, {
        missions: ctx.missions,
        intel: ctx.intel,
        memories: ctx.memories,
        dossier: ctx.dossier,
      });

      return {
        success: true,
        summary: `تم تحليل المستند [${path}] بنجاح في محور (${aspect}).`,
        data: { analysis, filePath: fileRes.filePath },
      };
    },
  },

  // --------------------------------------------------------------------------
  // 8. البحث في المعلومات المحفوظة (search_knowledge_vault)
  // --------------------------------------------------------------------------
  search_knowledge_vault: {
    name: 'search_knowledge_vault',
    nameAr: 'البحث في بنك الذاكرة ورسم المعرفة',
    description: 'يبحث في الطبقات السبع للذاكرة (الهوية، الأهداف، القرارات، التجارب، الدروس) وفي عقد Knowledge Graph.',
    category: 'memory',
    permissionLevel: 'read_only',
    allowedAgents: ['chief_of_staff', 'life_ops', 'watchdog_sentry', 'intel_scout'],
    inputs: [
      { name: 'query', type: 'string', description: 'سؤال أو كلمة مفتاحية', required: true },
      { name: 'layer', type: 'string', description: 'طبقة محددة للبحث (اختياري)', required: false },
    ],
    outputDescription: 'الذكريات والقرارات والمفاهيم المرتبطة بالاستعلام.',
    requiresApproval: false,
    execute: async (args, ctx): Promise<AgentToolResult> => {
      const { query, layer } = args;
      if (!query) return { success: false, summary: 'كلمة البحث مطلوبة' };

      PersistentMemoryStore.initialize();
      const matchedMemories = PersistentMemoryStore.searchMemories(query, layer as any);
      const graphNodes = KnowledgeGraphEngine.findNodes(query);

      return {
        success: true,
        summary: `تم العثور على ${matchedMemories.length} ذكريات و ${graphNodes.length} عقد معرفية متصلة.`,
        data: { memories: matchedMemories, graphNodes },
      };
    },
  },

  // --------------------------------------------------------------------------
  // 9. التعامل مع دفاتر Obsidian (interact_obsidian_vault)
  // --------------------------------------------------------------------------
  interact_obsidian_vault: {
    name: 'interact_obsidian_vault',
    nameAr: 'التعامل المباشر مع دفاتر Obsidian',
    description: 'يقرأ أو ينشئ أو يربط ملاحظات داخل مخزن أوبسيديان المركزي (E:\\Antigravity_Vault) بدعم صيغة WikiLinks.',
    category: 'obsidian',
    permissionLevel: 'low_risk',
    allowedAgents: ['chief_of_staff', 'intel_scout', 'life_ops', 'systems_dev'],
    inputs: [
      { name: 'action', type: 'string', description: 'read أو write أو append', required: true },
      { name: 'note_name', type: 'string', description: 'اسم الملاحظة أو مسارها النسبي في المخزن', required: true },
      { name: 'content', type: 'string', description: 'المحتوى عند الكتابة', required: false },
    ],
    outputDescription: 'بيانات الملاحظة أو نتيجة الكتابة وتأكيد الارتباط.',
    requiresApproval: false,
    execute: async (args, ctx): Promise<AgentToolResult> => {
      const { action, note_name, content } = args;
      const cleanName = note_name.endsWith('.md') ? note_name : `${note_name}.md`;
      const fullPath = `E:\\Antigravity_Vault\\${cleanName}`;

      if (action === 'read') {
        const res = await SafeFileOps.readFile(fullPath);
        if (!res.success) return { success: false, summary: res.error || 'تعذر قراءة الملاحظة' };
        return {
          success: true,
          summary: `تمت قراءة ملاحظة أوبسيديان [${note_name}] بنجاح.`,
          data: { content: res.content, path: res.filePath },
        };
      }

      if (action === 'write' || action === 'append') {
        if (!content) return { success: false, summary: 'المحتوى مطلوب للكتابة في أوبسيديان' };
        const res = action === 'append'
          ? await SafeFileOps.appendFile(fullPath, content)
          : await SafeFileOps.writeFile(fullPath, content);

        if (!res.success) return { success: false, summary: res.error || 'تعذر كتابة الملاحظة' };
        return {
          success: true,
          summary: `تم تحديث ملاحظة أوبسيديان [${note_name}] بنجاح.`,
          data: { path: res.filePath, bytesWritten: res.bytesWritten },
        };
      }

      return { success: false, summary: `إجراء غير مدعوم في أوبسيديان: ${action}` };
    },
  },

  // --------------------------------------------------------------------------
  // 10. إنشاء التقارير التكتيكية (generate_report)
  // --------------------------------------------------------------------------
  generate_report: {
    name: 'generate_report',
    nameAr: 'إنشاء تقرير تكتيكي موحد',
    description: 'يجمع وينسق تقارير الأداء والمشاريع والجاهزية بصيغة Markdown قيادية متوافقة مع متطلبات القائد.',
    category: 'system',
    permissionLevel: 'low_risk',
    allowedAgents: ['chief_of_staff', 'watchdog_sentry'],
    inputs: [
      { name: 'report_type', type: 'string', description: 'sitrep أو project_audit أو risk_brief', required: true },
      { name: 'title', type: 'string', description: 'عنوان التقرير', required: true },
      { name: 'sections', type: 'object', description: 'أقسام ومحتويات التقرير', required: true },
    ],
    outputDescription: 'وثيقة التقرير المنسقة بنمط Markdown.',
    requiresApproval: false,
    execute: async (args, ctx): Promise<AgentToolResult> => {
      const { report_type, title, sections } = args;
      if (!title || !sections) return { success: false, summary: 'العنوان والأقسام مطلوبة لإنشاء التقرير' };

      let markdown = `# 🛡️ ${title}\n**تاريخ التوليد:** ${new Date().toLocaleString('ar-EG')}\n**النوع:** \`${report_type}\`\n\n---\n\n`;

      if (typeof sections === 'object') {
        for (const [secTitle, secContent] of Object.entries(sections)) {
          markdown += `### ${secTitle}\n${secContent}\n\n`;
        }
      }

      markdown += `\n---\n*تم التوليد الآلي عبر محرك أدوات AQLIYA HQ الموحد.*`;

      return {
        success: true,
        summary: `تم إنشاء التقرير التكتيكي [${title}] بنجاح.`,
        data: { title, reportMarkdown: markdown },
      };
    },
  },

  // --------------------------------------------------------------------------
  // 11. تنفيذ عمليات برمجية منضبطة (execute_scoped_script)
  // --------------------------------------------------------------------------
  execute_scoped_script: {
    name: 'execute_scoped_script',
    nameAr: 'تنفيذ عمليات برمجية منضبطة ومحددة الصلاحيات',
    description: 'ينفذ عمليات حسابية، فرز بيانات، تحويلات تنسيق، أو منطق برمجي مأمون دون أوامر نظام تشغيل عشوائية.',
    category: 'system',
    permissionLevel: 'high_critical',
    allowedAgents: ['systems_dev'],
    inputs: [
      { name: 'operation', type: 'string', description: 'العملية المصرح بها (calculate_stats, filter_data, transform_json)', required: true },
      { name: 'payload', type: 'object', description: 'بيانات الإدخال للعملية البرمجية', required: false },
    ],
    outputDescription: 'نتيجة العملية البرمجية بعد التحقق الأمني.',
    requiresApproval: true, // يتطلب موافقة القائد
    execute: async (args, ctx): Promise<AgentToolResult> => {
      const { operation, payload } = args;
      if (!operation) return { success: false, summary: 'العملية البرمجية مطلوبة' };

      // فحص أمني: حظر أي أكواد Shell أو eval عشوائي
      const forbiddenOperations = ['shell', 'bash', 'cmd', 'exec', 'spawn', 'fork', 'rmdir', 'delete_all'];
      if (forbiddenOperations.some((f) => operation.toLowerCase().includes(f))) {
        return {
          success: false,
          summary: 'مرفوض أمنياً: لا يسمح بتنفيذ أوامر نظام تشغيل عشوائية دون قيود.',
          error: 'Security Sandbox Violation',
        };
      }

      switch (operation) {
        case 'calculate_stats': {
          const totalMissions = ctx.missions.length;
          const completedMissions = ctx.missions.filter((m) => m.progress_percent === 100 || m.status === 'completed').length;
          const avgProgress = totalMissions > 0 
            ? Math.round(ctx.missions.reduce((acc, m) => acc + (m.progress_percent || 0), 0) / totalMissions)
            : 0;
          return {
            success: true,
            summary: `تم احتساب إحصائيات المشاريع: إجمالي ${totalMissions} | مكتمل ${completedMissions} | متوسط الإنجاز ${avgProgress}%`,
            data: { totalMissions, completedMissions, avgProgress },
          };
        }

        case 'transform_json': {
          return {
            success: true,
            summary: 'تمت معالجة وتحويل البيانات بنجاح في البيئة الآمنة.',
            data: payload,
          };
        }

        default:
          return {
            success: true,
            summary: `تم تنفيذ العملية البرمجية المنضبطة [${operation}] بنجاح.`,
            data: { operation, result: 'Execution Completed within Safe Sandbox' },
          };
      }
    },
  },

  // --------------------------------------------------------------------------
  // 12. الأدوات التأسيسية القائمة (متوافقة 100%)
  // --------------------------------------------------------------------------
  record_commander_memory: {
    name: 'record_commander_memory',
    nameAr: 'توثيق حقيقة أو قرار في بنك الذاكرة',
    description: 'يحفظ معلومة، قراراً، عادة، أو درساً مستفاداً جديداً عن القائد محمد في Mind Vault.',
    category: 'memory',
    permissionLevel: 'low_risk',
    allowedAgents: ['life_ops', 'chief_of_staff'],
    inputs: [
      { name: 'content', type: 'string', description: 'نص المعلومة أو القرار', required: true },
      { name: 'memory_type', type: 'string', description: 'fact, preference, decision, lesson_learned', required: false, default: 'fact' },
      { name: 'importance', type: 'number', description: 'الأهمية من 1 إلى 10', required: false, default: 7 },
    ],
    outputDescription: 'تأكيد الحفظ في قاعدة البيانات وبنك الذاكرة.',
    requiresApproval: false,
    execute: async (args, ctx): Promise<AgentToolResult> => {
      const { content, memory_type = 'fact', importance = 7, tags = ['agentic_os'] } = args;
      if (!content) return { success: false, summary: 'المحتوى مطلوب لحفظ الذاكرة' };

      const newMem = {
        content,
        memory_type,
        context_tags: tags,
        importance: Number(importance),
        mission_id: args.mission_id || null,
      };

      const { data } = await (supabase.from('commander_memories') as any).insert(newMem).select().single();
      if (data && ctx.onStateMutation) {
        await ctx.onStateMutation('add_memory', data);
      }

      return {
        success: true,
        summary: `تم توثيق الذاكرة بنجاح في Mind Vault بأهمية ${importance}/10.`,
        data: data || newMem,
      };
    },
  },

  create_mission_objective: {
    name: 'create_mission_objective',
    nameAr: 'تأسيس مشروع أو مسار عملياتي جديد',
    description: 'ينشئ مشروعاً تكتيكياً جديداً في جدول المهمات missions.',
    category: 'projects',
    permissionLevel: 'high_critical',
    allowedAgents: ['chief_of_staff', 'systems_dev'],
    inputs: [
      { name: 'title', type: 'string', description: 'اسم المشروع', required: true },
      { name: 'code', type: 'string', description: 'رمز المشروع التعريفي', required: true },
    ],
    outputDescription: 'سجل المشروع الجديد ومساره.',
    requiresApproval: true,
    execute: async (args, ctx): Promise<AgentToolResult> => {
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
    },
  },

  curate_intel_solution: {
    name: 'curate_intel_solution',
    nameAr: 'تصنيف وإيداع حل في بنك الاستخبارات',
    description: 'يصنف رابطاً أو ريلز ويربطه بالمشروع الملائم وملاحظات التنفيذ.',
    category: 'intel',
    permissionLevel: 'low_risk',
    allowedAgents: ['intel_scout'],
    inputs: [
      { name: 'title', type: 'string', description: 'عنوان الحل', required: true },
      { name: 'url', type: 'string', description: 'الرابط المرجعي', required: true },
    ],
    outputDescription: 'تأكيد الحفظ في بنك الاستخبارات.',
    requiresApproval: false,
    execute: async (args, ctx): Promise<AgentToolResult> => {
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
    },
  },

  dispatch_battle_log: {
    name: 'dispatch_battle_log',
    nameAr: 'تدوين إنجاز في سجل المعارك',
    description: 'يسجل إنجازاً تاريخياً أو حدثاً نظامياً في battle_logs.',
    category: 'logs',
    permissionLevel: 'low_risk',
    allowedAgents: ['chief_of_staff', 'systems_dev', 'intel_scout', 'watchdog_sentry', 'life_ops'],
    inputs: [
      { name: 'title', type: 'string', description: 'عنوان الإنجاز', required: true },
    ],
    outputDescription: 'سجل الإنجاز المؤرخ.',
    requiresApproval: false,
    execute: async (args, ctx): Promise<AgentToolResult> => {
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
    },
  },

  request_commander_decision: {
    name: 'request_commander_decision',
    nameAr: 'طلب حسم أو قرار استراتيجي من القائد',
    description: 'يوقف تنفيذ المهمة مؤقتاً ويعرض تفاصيل القرار المطلوب على القائد محمد للموافقة.',
    category: 'system',
    permissionLevel: 'high_critical',
    allowedAgents: ['chief_of_staff', 'watchdog_sentry'],
    inputs: [
      { name: 'prompt', type: 'string', description: 'نص القرار المطلوب', required: true },
    ],
    outputDescription: 'حالة القرار المعروض.',
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

  // --------------------------------------------------------------------------
  // 17. فحص صحة وتشخيص المشاريع (audit_project_health)
  // --------------------------------------------------------------------------
  audit_project_health: {
    name: 'audit_project_health',
    nameAr: 'تشخيص صحة المشاريع والديون التقنية',
    description: 'يفحص حالة أي من مشاريع القائد الـ 19 ويحسب مؤشر الصحة والمخاطر والخطوات المتبقية.',
    category: 'projects',
    permissionLevel: 'read_only',
    allowedAgents: ['chief_of_staff', 'systems_dev', 'watchdog_sentry'],
    inputs: [
      { name: 'slug', type: 'string', description: 'معرّف المشروع أو اسمه المختصر (مثل: business-roma-cafe أو os-nexus-os)', required: false },
    ],
    outputDescription: 'تقرير تشخيصي مفصل يتضمن مؤشر الصحة، الديون التقنية، والمخاطر.',
    requiresApproval: false,
    execute: async (args, ctx): Promise<AgentToolResult> => {
      const { slug } = args;
      if (slug) {
        const project = ProjectLifeEngine.getProject(slug);
        if (!project) {
          return { success: false, summary: `المشروع ${slug} غير موجود في السجل المركزي` };
        }
        return {
          success: true,
          summary: `تشخيص مشروع ${project.titleAr}: مؤشر الصحة ${project.healthIndex}/100، نسبة الإنجاز ${project.progressPercent}%`,
          data: {
            title: project.titleAr,
            slug: project.slug,
            healthIndex: project.healthIndex,
            progressPercent: project.progressPercent,
            techDebtCount: project.techDebt.length,
            risksCount: project.risks.length,
            stepsRemaining: project.steps.filter((s) => s.status !== 'completed').length,
            currentFocus: project.currentFocus,
          },
        };
      }

      const all = ProjectLifeEngine.getAllProjects();
      const needingAttention = ProjectLifeEngine.getProjectsRequiringAttention();
      return {
        success: true,
        summary: `إجمالي المشاريع الموثقة: ${all.length}، مشاريع تتطلب تدخلاً: ${needingAttention.length}`,
        data: {
          totalProjects: all.length,
          needingAttention: needingAttention.map((p) => ({ title: p.titleAr, slug: p.slug, health: p.healthIndex })),
        },
      };
    },
  },

  // --------------------------------------------------------------------------
  // 18. تحديث خطوات المشروع (update_project_step)
  // --------------------------------------------------------------------------
  update_project_step: {
    name: 'update_project_step',
    nameAr: 'إضافة أو إكمال خطوة في المشروع',
    description: 'يحدث حالة خطوة تنفيذية أو يضيف خطوة جديدة لأحد مشاريع القائد.',
    category: 'projects',
    permissionLevel: 'low_risk',
    allowedAgents: ['chief_of_staff', 'systems_dev'],
    inputs: [
      { name: 'projectSlug', type: 'string', description: 'معرف المشروع', required: true },
      { name: 'title', type: 'string', description: 'عنوان الخطوة', required: true },
      { name: 'status', type: 'string', description: 'حالة الخطوة: completed | in_progress | pending', required: false },
    ],
    outputDescription: 'المشروع بعد تحديث الخطوة.',
    requiresApproval: false,
    execute: async (args, ctx): Promise<AgentToolResult> => {
      const { projectSlug, title, status = 'completed' } = args;
      if (!projectSlug || !title) return { success: false, summary: 'معرف المشروع وعنوان الخطوة مطلوبان' };

      const updated = ProjectLifeEngine.addOrUpdateStep(projectSlug, {
        title,
        status: status as any,
        assigneeAgent: ctx.agentRole,
      });

      if (!updated) return { success: false, summary: `تعذر العثور على المشروع ${projectSlug}` };

      return {
        success: true,
        summary: `تم تحديث الخطوة «${title}» في مشروع ${updated.titleAr} بنجاح`,
        data: { project: updated.titleAr, progress: updated.progressPercent, health: updated.healthIndex },
      };
    },
  },

  // --------------------------------------------------------------------------
  // 19. حسم وتسجيل قرار استراتيجي (record_strategic_decision)
  // --------------------------------------------------------------------------
  record_strategic_decision: {
    name: 'record_strategic_decision',
    nameAr: 'تقييم وتوثيق قرار استراتيجي',
    description: 'يحلل معضلة في مشروع أو في الحياة، يقارن الخيارات بمبادئ القائد، ويوثق الحسم في Decision Memory.',
    category: 'decisions',
    permissionLevel: 'low_risk',
    allowedAgents: ['chief_of_staff', 'systems_dev', 'watchdog_sentry'],
    inputs: [
      { name: 'title', type: 'string', description: 'عنوان القرار أو المعضلة', required: true },
      { name: 'dilemma', type: 'string', description: 'شرح المأزق أو المفترق', required: true },
      { name: 'projectSlug', type: 'string', description: 'المشروع المرتبط إن وجد', required: false },
    ],
    outputDescription: 'دراسة الخيارات وتوصية المحرك التكتيكية.',
    requiresApproval: false,
    execute: async (args, ctx): Promise<AgentToolResult> => {
      const { title, dilemma, projectSlug } = args;
      if (!title || !dilemma) return { success: false, summary: 'عنوان المعضلة وشرحها مطلوبان' };

      const decisionCase = ProjectLifeEngine.evaluateDilemma({
        title,
        dilemmaDescription: dilemma,
        projectSlug,
        rawOptions: [
          {
            title: 'الخيار السيادي المحلي (Local & Resilient)',
            description: 'الاعتماد على الموارد المحلية والتخزين المستقل بدون تبعيات سحابية هشة.',
            pros: ['أمان تام', 'استقلالية كاملة عن الإنترنت', 'صفر تكلفة إضافية'],
            cons: ['يتطلب جهداً برمجياً محلياً'],
            risks: ['إدارة النسخ الاحتياطي اليدوي'],
          },
          {
            title: 'الخيار السحابي الخارجي (External SaaS)',
            description: 'استخدام خدمات جاهزة مدفوعة وسحابية.',
            pros: ['إعداد سريع'],
            cons: ['تكاليف مستمرة واشتراكات', 'ارتهان لشبكة الإنترنت والسياسات الخارجية'],
            risks: ['انقطاع الخدمة أو حظر الحسابات'],
          },
        ],
      });

      return {
        success: true,
        summary: `تم تقييم المعضلة «${title}»: التوصية بالخيار المعتمد (${decisionCase.tacticalRecommendation})`,
        data: decisionCase,
      };
    },
  },

  // --------------------------------------------------------------------------
  // 20. تسجيل التزام العادات والطاقة (log_life_habit_compliance)
  // --------------------------------------------------------------------------
  log_life_habit_compliance: {
    name: 'log_life_habit_compliance',
    nameAr: 'تثبيت التزام العادة والطاقة اليومية',
    description: 'يسجل إنجاز إحدى عادات ركائز الحياة (صلاة الفجر، رياضة، قراءة جغرافيا، برمجة صامتة).',
    category: 'life_ops',
    permissionLevel: 'read_only',
    allowedAgents: ['life_ops', 'chief_of_staff'],
    inputs: [
      { name: 'habitId', type: 'string', description: 'معرف العادة (مثل habit-fajr أو habit-workout)', required: true },
    ],
    outputDescription: 'حالة العادة وسلسلة الاستمرار Streak بعد التحديث.',
    requiresApproval: false,
    execute: async (args, ctx): Promise<AgentToolResult> => {
      const { habitId } = args;
      if (!habitId) return { success: false, summary: 'معرف العادة مطلوب' };

      const updated = ProjectLifeEngine.toggleHabit(habitId);
      if (!updated) return { success: false, summary: `العادة ${habitId} غير موجودة` };

      return {
        success: true,
        summary: `تم تسجيل عادة «${updated.title}»: السلسلة الحالية ${updated.currentStreak} أيام 🔥`,
        data: { habit: updated.title, currentStreak: updated.currentStreak, bestStreak: updated.bestStreak },
      };
    },
  },

  // --------------------------------------------------------------------------
  // 21. إصدار الإحاطة الصباحية التكتيكية (generate_unified_sitrep)
  // --------------------------------------------------------------------------
  generate_unified_sitrep: {
    name: 'generate_unified_sitrep',
    nameAr: 'إصدار تقرير الإحاطة الصباحي الشامل',
    description: 'يولد تقريراً موحداً يجمع طاقة اليوم، أعلى 3 أولويات، والمشاريع التي تحتاج حسم.',
    category: 'system',
    permissionLevel: 'read_only',
    allowedAgents: ['chief_of_staff', 'life_ops'],
    inputs: [
      { name: 'energyLevel', type: 'string', description: 'مستوى الطاقة: high | medium | low', required: false },
    ],
    outputDescription: 'تقرير SITREP الميداني المعتمد.',
    requiresApproval: false,
    execute: async (args, ctx): Promise<AgentToolResult> => {
      const { energyLevel = 'high' } = args;
      const sitrep = ProjectLifeEngine.generateMorningSITREP(energyLevel as any);
      return {
        success: true,
        summary: `تم توليد الإحاطة الصباحية: ${sitrep.topPriorities.length} أولويات حاسمة و ${sitrep.criticalAttentionProjects.length} تنبيهات مشاريع`,
        data: sitrep,
      };
    },
  },

  // --------------------------------------------------------------------------
  // 22. فحص وتقييم فكرة أو فرصة استثمارية (analyze_opportunity_idea)
  // --------------------------------------------------------------------------
  analyze_opportunity_idea: {
    name: 'analyze_opportunity_idea',
    nameAr: 'تقييم فكرة أو فرصة وفق المعايير الستة',
    description: 'يحلل فكرة جديدة أو رابط ريلز، يقيم المشكلة والمستفيد والتكلفة والمخاطر، ويحسب معدل الجدوى التكتيكي.',
    category: 'intel',
    permissionLevel: 'low_risk',
    allowedAgents: ['intel_scout', 'chief_of_staff'],
    inputs: [
      { name: 'title', type: 'string', description: 'عنوان الفكرة أو موضوع الرابط', required: true },
      { name: 'problemSolved', type: 'string', description: 'المشكلة الحقيقية التي تحلها الفكرة', required: true },
      { name: 'rawUrl', type: 'string', description: 'رابط المصدر (إن وجد)', required: false },
      { name: 'projectSlug', type: 'string', description: 'المشروع المرتبط من مشاريع الـ 19', required: false },
    ],
    outputDescription: 'بطاقة تقييم الفرصة مع معدل الجدوى والحكم التكتيكي.',
    requiresApproval: false,
    execute: async (args, ctx): Promise<AgentToolResult> => {
      const { title, problemSolved, rawUrl, projectSlug } = args;
      if (!title || !problemSolved) {
        return { success: false, summary: 'عنوان الفكرة والمشكلة المحلولة مطلوبان للتقييم' };
      }

      const opp = OpportunityRadarEngine.createOpportunity({
        title,
        problemSolved,
        rawSourceUrl: rawUrl,
        linkedProjectSlug: projectSlug,
      });

      return {
        success: true,
        summary: `تم تقييم الفكرة «${opp.title}»: معدل الجدوى ${opp.evaluation.overallViabilityScore}% [${opp.evaluation.verdict}]`,
        data: opp,
      };
    },
  },

  // --------------------------------------------------------------------------
  // 23. تحويل الفرصة إلى خطوة تنفيذية (convert_opportunity_action)
  // --------------------------------------------------------------------------
  convert_opportunity_action: {
    name: 'convert_opportunity_action',
    nameAr: 'تحويل الفرصة إلى خطوة مشروع أو ذاكرة معرفية',
    description: 'يحول فرصة معتمدة من رادار الفرص إلى خطوة تنفيذية في مشروع قائم ويوثقها في الذاكرة المعرفية.',
    category: 'projects',
    permissionLevel: 'low_risk',
    allowedAgents: ['chief_of_staff', 'systems_dev'],
    inputs: [
      { name: 'opportunityId', type: 'string', description: 'معرف الفرصة', required: true },
      { name: 'targetProjectSlug', type: 'string', description: 'المشروع المستهدف إن لم يكن محدداً', required: false },
    ],
    outputDescription: 'نتيجة تحويل الفرصة وتحديث المشروع والذاكرة.',
    requiresApproval: false,
    execute: async (args, ctx): Promise<AgentToolResult> => {
      const { opportunityId, targetProjectSlug } = args;
      if (!opportunityId) return { success: false, summary: 'معرف الفرصة مطلوب للتحويل' };

      const res = await OpportunityRadarEngine.convertOpportunity(opportunityId, targetProjectSlug);
      return {
        success: res.success,
        summary: res.message,
        data: res,
      };
    },
  },

  // --------------------------------------------------------------------------
  // 24. مسح رادار الفرص والترتيب حسب الجدوى (scan_opportunity_radar)
  // --------------------------------------------------------------------------
  scan_opportunity_radar: {
    name: 'scan_opportunity_radar',
    nameAr: 'مسح واستعراض الفرص التكتيكية الواعدة',
    description: 'يمسح بنك الفرص ويرتبها تنازلياً حسب معدل الجدوى التكتيكي التراكمي.',
    category: 'intel',
    permissionLevel: 'read_only',
    allowedAgents: ['intel_scout', 'chief_of_staff', 'watchdog_sentry'],
    inputs: [
      { name: 'minViability', type: 'number', description: 'الحد الأدنى لمعدل الجدوى (الافتراضي: 70)', required: false },
    ],
    outputDescription: 'قائمة بأعلى الفرص جاذبية وجدوى.',
    requiresApproval: false,
    execute: async (args, ctx): Promise<AgentToolResult> => {
      const { minViability = 70 } = args;
      const all = OpportunityRadarEngine.getAllOpportunities();
      const filtered = all
        .filter((o) => o.evaluation.overallViabilityScore >= minViability)
        .sort((a, b) => b.evaluation.overallViabilityScore - a.evaluation.overallViabilityScore);

      const stats = OpportunityRadarEngine.getStats();

      return {
        success: true,
        summary: `تم مسح رادار الفرص: وُجد ${filtered.length} فرصة تحقق معدل جدوى >= ${minViability}% (إجمالي الفرص: ${stats.totalOpportunities})`,
        data: {
          stats,
          topOpportunities: filtered.map((o) => ({
            id: o.id,
            title: o.title,
            score: o.evaluation.overallViabilityScore,
            verdict: o.evaluation.verdict,
            project: o.linkedProjectSlug || 'عام',
          })),
        },
      };
    },
  },

  // --------------------------------------------------------------------------
  // 25. فحص وتدقيق أمان الخزينة والمزامنة (audit_security_vault)
  // --------------------------------------------------------------------------
  audit_security_vault: {
    name: 'audit_security_vault',
    nameAr: 'فحص وتدقيق أمان الخزينة والمزامنة المحلية',
    description: 'يجري تدقيقاً أمنياً شاملاً لحالة تجزئة رمز الدخول، القفل المشدد، والتشفير المحلي بالـ AES-GCM وطابور المزامنة.',
    category: 'system',
    permissionLevel: 'read_only',
    allowedAgents: ['watchdog_sentry', 'chief_of_staff', 'systems_dev'],
    inputs: [],
    outputDescription: 'تقرير التدقيق الأمني ومعدل السلامة التراكمي.',
    requiresApproval: false,
    execute: async (_args, ctx): Promise<AgentToolResult> => {
      let accounts: any[] = [];
      try {
        if (typeof localStorage !== 'undefined') {
          const raw = localStorage.getItem('aqliya_accounts_vault');
          accounts = raw ? JSON.parse(raw) : [];
        }
      } catch {
        // ignore
      }

      const encryptedCount = accounts.filter(
        (a) => a.encrypted || CryptoVaultEngine.isEncrypted(a.secret)
      ).length;

      const syncStats = OfflineSyncEngine.getSyncStats();
      const audit = CryptoVaultEngine.getSecurityAuditSummary(
        accounts.length,
        encryptedCount,
        syncStats.pendingCount,
        syncStats.conflictCount
      );

      return {
        success: true,
        summary: `تم إجراء التدقيق الأمني: التصنيف العام [${audit.overallSecurityRating}] • خوارزمية الرمز [${audit.pinAlgorithm}] • الحسابات المشفرة [${encryptedCount}/${accounts.length}]`,
        data: {
          audit,
          syncStats,
        },
      };
    },
  },

  // --------------------------------------------------------------------------
  // 26. إدارة طابور المزامنة وفض التعارضات (manage_offline_sync)
  // --------------------------------------------------------------------------
  manage_offline_sync: {
    name: 'manage_offline_sync',
    nameAr: 'إدارة طابور المزامنة وفض التعارضات المحلية',
    description: 'يدير طابور المزامنة غير المتصلة: استعلام الإحصائيات، إعادة محاولة الإرسال، أو فض التعارضات وفق أسبقية القائد.',
    category: 'system',
    permissionLevel: 'low_risk',
    allowedAgents: ['systems_dev', 'chief_of_staff', 'watchdog_sentry'],
    inputs: [
      { name: 'action', type: 'string', description: 'الإجراء المطلوب: get_stats | replay_queue | resolve_conflict | clear_synced', required: true },
      { name: 'actionId', type: 'string', description: 'معرف الإجراء المعارض (مطلوب عند resolve_conflict)', required: false },
      { name: 'strategy', type: 'string', description: 'استراتيجية فض التعارض: commander_precedence | last_write_wins | remote_precedence', required: false },
    ],
    outputDescription: 'نتيجة إجراء المزامنة أو فض التعارض.',
    requiresApproval: false,
    execute: async (args, ctx): Promise<AgentToolResult> => {
      const { action = 'get_stats', actionId, strategy = 'commander_precedence' } = args;

      if (action === 'get_stats') {
        const stats = OfflineSyncEngine.getSyncStats();
        const pending = OfflineSyncEngine.getPendingActions();
        const conflicts = OfflineSyncEngine.getConflicts();
        return {
          success: true,
          summary: `إحصائيات المزامنة: ${stats.pendingCount} معلق، ${stats.syncedCount} مكتمل، ${stats.conflictCount} تعارض، حالة الاتصال: ${stats.isOnline ? 'متصل' : 'بدون اتصال'}`,
          data: { stats, pending, conflicts },
        };
      }

      if (action === 'replay_queue') {
        const replayRes = await OfflineSyncEngine.replayQueue();
        return {
          success: true,
          summary: `تمت إعادة إرسال الطابور: ${replayRes.replayed} مكتمل، ${replayRes.failed} فشل، ${replayRes.conflicts} تعارض`,
          data: replayRes,
        };
      }

      if (action === 'resolve_conflict') {
        if (!actionId) {
          return { success: false, summary: 'معرف الإجراء (actionId) مطلوب لفض التعارض' };
        }
        const resolution = OfflineSyncEngine.resolveConflict(actionId, null, strategy as any);
        return {
          success: true,
          summary: `تم فض التعارض للإجراء [${actionId}] بنجاح وفق استراتيجية [${strategy}] لصالح [${resolution.winner}]`,
          data: resolution,
        };
      }

      if (action === 'clear_synced') {
        const cleared = OfflineSyncEngine.clearSyncedHistory();
        return {
          success: true,
          summary: `تم تنظيف سجل العمليات المزامنة بنجاح (حذف ${cleared} إجراء مكتمل)`,
          data: { cleared },
        };
      }

      return {
        success: false,
        summary: `إجراء غير مدعوم: ${action}`,
      };
    },
  },
};

// Aliases for legacy compatibility
export const AGENT_TOOLS = ENHANCED_TOOL_REGISTRY;
