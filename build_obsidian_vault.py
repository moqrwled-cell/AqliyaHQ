import os
import shutil
import sqlite3
import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

VAULT_DIR = r"E:\Antigravity_Vault"
BRAIN_DIR = r"C:\Users\lenovo\.gemini\antigravity\brain"
DB_PATH = r"C:\Users\lenovo\.gemini\antigravity\conversation_summaries.db"

os.makedirs(VAULT_DIR, exist_ok=True)
projects_base = os.path.join(VAULT_DIR, "Projects")
os.makedirs(projects_base, exist_ok=True)

# 1. Connect to SQLite to get conversation titles
conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

conv_map = {}

# Query summaries
rows = cursor.execute("""
    SELECT conversation_id, title, preview, last_modified_time 
    FROM conversation_summaries
""").fetchall()

for cid, title, preview, mtime in rows:
    t = title.strip() if (title and title.strip()) else ""
    if not t and preview:
        clean_p = preview.split("\n")[0].strip()
        if len(clean_p) > 60:
            clean_p = clean_p[:57] + "..."
        t = clean_p
    conv_map[cid] = {
        "title": t,
        "mtime": mtime or 0,
        "files": []
    }

# Query FTS for any missing titles
for cid, title in cursor.execute("SELECT conversation_id, title FROM conversations_fts WHERE title != ''").fetchall():
    if cid in conv_map and not conv_map[cid]["title"]:
        conv_map[cid]["title"] = title.strip()
    elif cid not in conv_map:
        conv_map[cid] = {"title": title.strip(), "mtime": 0, "files": []}

def sanitize_folder_name(name):
    clean = re.sub(r'[\\/*?:"<>|]', "", name).strip()
    if not clean:
        clean = "مشروع_غير_معنون"
    return clean[:70]

# Known categories
CATEGORIES = {
    "Operating Systems & AI": [
        "عقلية", "AQLIYA", "Nexus", "Router", "OmniRoute", "إدارة الأفكار", "نظام تشغيل"
    ],
    "Business & Cafe": [
        "روما", "كفي", "كوفي", "سوبر ماركت", "مقداد", "مشروبات", "قائمة"
    ],
    "Life & Productivity": [
        "تنظيم الحياة", "الذاكرة العشوائية", "حضور", "بطاقة جوجل", "جوال‌بي", "مضاعفة أوراق"
    ],
    "Academics & Geography": [
        "جغرافيا", "محاضرات", "الامتحانات", "حل الواجب", "دراسة"
    ],
    "Tools & Engineering": [
        "Gmail", "ألعاب بطاقات", "مايكروتك", "بطاقات", "ورق", "Scorekeeper"
    ]
}

def get_category(title):
    for cat, keywords in CATEGORIES.items():
        for kw in keywords:
            if kw.lower() in title.lower():
                return cat
    return "General & Uncategorized"

# Scan brain folders
valid_projects = {}

for folder_name in os.listdir(BRAIN_DIR):
    folder_path = os.path.join(BRAIN_DIR, folder_name)
    if not os.path.isdir(folder_path):
        continue
    
    cid = folder_name
    title = conv_map.get(cid, {}).get("title", "")
    if not title:
        # Check if folder has any markdown with a title
        for f in os.listdir(folder_path):
            if f.endswith(".md") and not f.startswith("."):
                try:
                    with open(os.path.join(folder_path, f), "r", encoding="utf-8", errors="ignore") as mf:
                        for line in mf:
                            if line.startswith("# "):
                                title = line[2:].strip()
                                break
                except:
                    pass
            if title:
                break
    
    if not title:
        title = f"محادثة_{cid[:8]}"
        
    safe_title = sanitize_folder_name(title)
    
    # Collect markdown and image files
    project_files = []
    for root, dirs, files in os.walk(folder_path):
        if ".system_generated" in root or ".git" in root:
            continue
        for f in files:
            ext = os.path.splitext(f)[1].lower()
            if ext in [".md", ".png", ".jpg", ".jpeg", ".svg", ".pdf"]:
                full_p = os.path.join(root, f)
                project_files.append((f, full_p))
                
    if project_files:
        valid_projects[cid] = {
            "title": title,
            "safe_title": safe_title,
            "category": get_category(title),
            "files": project_files,
            "folder_path": folder_path
        }

print(f"Total projects with artifacts/media identified: {len(valid_projects)}")

# Copy files to Vault
category_counts = {}
manifest = []

for cid, pdata in valid_projects.items():
    cat = pdata["category"]
    category_counts[cat] = category_counts.get(cat, 0) + 1
    
    target_dir = os.path.join(projects_base, cat, pdata["safe_title"])
    os.makedirs(target_dir, exist_ok=True)
    
    copied_mds = []
    for fname, src_path in pdata["files"]:
        dst_path = os.path.join(target_dir, fname)
        try:
            shutil.copy2(src_path, dst_path)
            if fname.endswith(".md"):
                copied_mds.append(fname)
        except Exception as e:
            pass
            
    manifest.append({
        "cid": cid,
        "title": pdata["title"],
        "safe_title": pdata["safe_title"],
        "category": cat,
        "md_files": copied_mds,
        "rel_dir": f"Projects/{cat}/{pdata['safe_title']}"
    })

# Add direct link to E:\AqliyaHQ source docs if present
aqliya_hq_src = r"E:\AqliyaHQ"
if os.path.exists(aqliya_hq_src):
    aqliya_target = os.path.join(projects_base, "Operating Systems & AI", "عقلية - AQLIYA HQ Live Repo")
    os.makedirs(aqliya_target, exist_ok=True)
    for f in ["README.md", "package.json"]:
        p = os.path.join(aqliya_hq_src, f)
        if os.path.exists(p):
            try:
                shutil.copy2(p, os.path.join(aqliya_target, f))
            except:
                pass

# Generate Master MOC (00 - لوحة السيطرة والشبكة المعرفية.md)
moc_lines = [
    "---",
    "title: لوحة السيطرة المركزية والشبكة المعرفية - أنتيجرافيتي",
    "tags: [antigravity, moc, master-hub, second-brain, aqliya]",
    "commander: محمد قرمان",
    "date: 2026-11-09",
    "---",
    "",
    "# 🌐 مستودع العقل المركزي التكتيكي | Antigravity Master Vault",
    "> **مرحباً بك يا قائد محمد.** هذا هو مخزن المعرفة المركزي الذي يربط كافة مشاريعك، تصاميمك المعمارية، وخططك البرمجية المنتجة عبر **Antigravity** ونظام **«عقلية»**.",
    "",
    "## 📊 إحصائيات المنظومة الحية",
    f"- **إجمالي المشاريع المفهرسة:** {len(manifest)} مشروع",
    f"- **المحاور المعرفية:** {len(category_counts)} فئات متخصصة",
    f"- **الحالة:** متزامن أوفلاين 100% مع جهازك ومتاح داخل Obsidian مباشرة",
    "",
    "---",
    "",
    "## 🗺️ خريطة المحاور والمشاريع (Maps of Content)",
    ""
]

# Group manifest by category
grouped = {}
for m in manifest:
    grouped.setdefault(m["category"], []).append(m)

cat_icons = {
    "Operating Systems & AI": "🧠",
    "Business & Cafe": "☕",
    "Life & Productivity": "🧬",
    "Academics & Geography": "📚",
    "Tools & Engineering": "🛠️",
    "General & Uncategorized": "📁"
}

for cat, items in grouped.items():
    icon = cat_icons.get(cat, "📁")
    moc_lines.append(f"### {icon} {cat}")
    moc_lines.append("| المشروع | الملفات ووثائق التصميم | المسار |")
    moc_lines.append("| :--- | :--- | :--- |")
    for item in sorted(items, key=lambda x: x["title"]):
        md_links = []
        for mdf in item["md_files"]:
            link_name = os.path.splitext(mdf)[0]
            md_links.append(f"[[{link_name}]]")
        links_str = " • ".join(md_links) if md_links else "*(ملفات وسائط/كود)*"
        moc_lines.append(f"| **[[{item['safe_title']}]]** | {links_str} | `{item['rel_dir']}` |")
    moc_lines.append("")

moc_lines.extend([
    "---",
    "",
    "## ⚡ روابط سريعة للمشاريع المحورية التي طلبتها:",
    "- ☕ **موقع إدارة كفي روما:** [[Projects/Business & Cafe/موقع ادارة كفي روما/implementation_plan|خطة كفي روما]] • [[Projects/Business & Cafe/موقع ادارة كفي روما/walkthrough|تقرير الإنجاز]]",
    "- 🧬 **تطوير تطبيق تنظيم الحياة:** [[Projects/Life & Productivity/تطوير تطبيق تنظيم الحياة/implementation_plan|خطة تنظيم الحياة]] • [[Projects/Life & Productivity/تطوير تطبيق تنظيم الحياة/walkthrough|المخرجات]]",
    "- 📚 **تنسيق وترتيب محاضرات الجغرافيا:** [[Projects/Academics & Geography/تنسيق وترتيب محاضرات الجغرافيا/new_world_geography_course|جغرافيا العالم الجديد]] • [[Projects/Academics & Geography/تنسيق وترتيب محاضرات الجغرافيا/regional_geography_lectures_1_to_5|المحاضرات 1-5]] • [[Projects/Academics & Geography/تنسيق وترتيب محاضرات الجغرافيا/regional_geography_lectures_6_to_10|المحاضرات 6-10]]",
    "- 🧠 **غرفة عمليات عقلية ونظام الوكلاء:** [[Projects/Operating Systems & AI/إنشاء نظام إدارة الأفكار والمشاريع/aqlia_agentic_os_blueprint|وثيقة معمارية Agentic OS]] • [[Projects/Operating Systems & AI/إنشاء نظام إدارة الأفكار والمشاريع/aqlia_system_blueprint|مخطط النظام المركزي]]",
    "",
    "---",
    "*تم التوليد والتنظيم الآلي بواسطة محرك Antigravity Master Vault Sync.*"
])

moc_path = os.path.join(VAULT_DIR, "00 - لوحة السيطرة والشبكة المعرفية (Antigravity MOC).md")
with open(moc_path, "w", encoding="utf-8") as f:
    f.write("\n".join(moc_lines))

print(f"Generated MOC at {moc_path}")

# Generate Canvas (Antigravity_Tactical_Radar.canvas)
canvas_nodes = [
    {
        "id": "node-commander",
        "type": "text",
        "text": "# 👑 القائد محمد قرمان\nمركز القيادة والتحكم الإستراتيجي\n(Gaza / Nexus Core)",
        "x": 0,
        "y": 0,
        "width": 320,
        "height": 180,
        "color": "4"
    },
    {
        "id": "node-aqliya",
        "type": "text",
        "text": "## 🧠 عقلية | AQLIYA HQ & Agentic OS\nنظام تشغيل الوكلاء وإدارة العمليات اليومية\n- المستشار التكتيكي\n- أسطول الوكلاء\n- بنك الاستخبارات والذاكرة",
        "x": 450,
        "y": -250,
        "width": 380,
        "height": 220,
        "color": "2"
    },
    {
        "id": "node-cafe",
        "type": "text",
        "text": "## ☕ موقع إدارة كفي روما (Roma Cafe)\nمنظومة إدارة الكافيه والطلبات وبطاقات الطاولات\n- Scorekeeper Web App\n- Menu & Beverage Design",
        "x": 450,
        "y": 150,
        "width": 380,
        "height": 200,
        "color": "3"
    },
    {
        "id": "node-geo",
        "type": "text",
        "text": "## 📚 محاضرات جغرافيا العالم الجديد\nالأرشيف الدراسي والمحاضرات المنظمة مع الخرائط\n- محاضرات 1 إلى 10\n- خرائط تضاريس ومناخ القارات",
        "x": -500,
        "y": 150,
        "width": 380,
        "height": 200,
        "color": "5"
    },
    {
        "id": "node-life",
        "type": "text",
        "text": "## 🧬 تطبيق تنظيم الحياة (Life Ops)\nالمعمارية المخصصة للتتبع، والعادات، والروتين اليومي",
        "x": -500,
        "y": -250,
        "width": 380,
        "height": 180,
        "color": "6"
    }
]

canvas_edges = [
    {"id": "edge-1", "fromNode": "node-commander", "fromSide": "right", "toNode": "node-aqliya", "toSide": "left", "label": "Command & Orchestration"},
    {"id": "edge-2", "fromNode": "node-commander", "fromSide": "bottom", "toNode": "node-cafe", "toSide": "top", "label": "Business Ops"},
    {"id": "edge-3", "fromNode": "node-commander", "fromSide": "bottom", "toNode": "node-geo", "toSide": "top", "label": "Academic Intel"},
    {"id": "edge-4", "fromNode": "node-commander", "fromSide": "left", "toNode": "node-life", "toSide": "right", "label": "Life Operations"}
]

canvas_data = {
    "nodes": canvas_nodes,
    "edges": canvas_edges
}

canvas_path = os.path.join(VAULT_DIR, "Antigravity_Tactical_Radar.canvas")
with open(canvas_path, "w", encoding="utf-8") as f:
    json.dump(canvas_data, f, ensure_ascii=False, indent=2)

print(f"Generated Canvas at {canvas_path}")

# Generate a 1-click update batch script in the vault
update_bat_path = os.path.join(VAULT_DIR, "تحديث_مخزن_Obsidian.bat")
with open(update_bat_path, "w", encoding="utf-8") as f:
    f.write(f'@echo off\nchcp 65001 > nul\necho جارٍ تحديث مخزن المعرفة من Antigravity...\npython "{os.path.abspath(__file__)}"\necho تم التحديث بنجاح! يمكنك الآن العودة إلى Obsidian.\npause\n')

print("Sync completed successfully!")
