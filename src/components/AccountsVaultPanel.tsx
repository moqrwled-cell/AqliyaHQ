import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Plus, 
  KeyRound, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  Trash2, 
  Search, 
  ExternalLink,
  CreditCard,
  Globe,
  Lock,
  Layers
} from 'lucide-react';

export interface AccountEntry {
  id: string;
  name: string;
  category: 'dev' | 'banking' | 'ai' | 'social' | 'study' | 'general';
  username: string;
  secret: string; // password, token or key
  url?: string;
  notes?: string;
  updated_at: string;
}

export const AccountsVaultPanel: React.FC = () => {
  const [accounts, setAccounts] = useState<AccountEntry[]>(() => {
    try {
      const saved = localStorage.getItem('aqliya_accounts_vault');
      return saved ? JSON.parse(saved) : [
        {
          id: 'acc-1',
          name: 'حساب GitHub الرئيسي',
          category: 'dev',
          username: 'moqrwled-cell',
          secret: 'ghp_••••••••••••••••••••',
          url: 'https://github.com',
          notes: 'مستودعات AqliyaHQ و NexusOS',
          updated_at: new Date().toISOString(),
        },
        {
          id: 'acc-2',
          name: 'قاعدة بيانات Supabase',
          category: 'dev',
          username: 'mohammad@aqliya.dev',
          secret: 'zydgpjqllgthkqabphth',
          url: 'https://supabase.com',
          notes: 'مشروع AqliyaHQ Cloud Hub',
          updated_at: new Date().toISOString(),
        },
        {
          id: 'acc-3',
          name: 'محفظة PalPay / جوال باي',
          category: 'banking',
          username: '059xxxxxxx',
          secret: '••••',
          notes: 'التحويلات والمعاملات المالية في غزة',
          updated_at: new Date().toISOString(),
        }
      ];
    } catch {
      return [];
    }
  });

  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<AccountEntry['category']>('dev');
  const [username, setUsername] = useState('');
  const [secret, setSecret] = useState('');
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');

  const saveAccounts = (updated: AccountEntry[]) => {
    setAccounts(updated);
    try {
      localStorage.setItem('aqliya_accounts_vault', JSON.stringify(updated));
    } catch (e) {
      console.warn('Accounts storage write error', e);
    }
  };

  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newAcc: AccountEntry = {
      id: `acc-${Date.now()}`,
      name: name.trim(),
      category,
      username: username.trim(),
      secret: secret.trim(),
      url: url.trim(),
      notes: notes.trim(),
      updated_at: new Date().toISOString(),
    };

    saveAccounts([newAcc, ...accounts]);
    setName('');
    setUsername('');
    setSecret('');
    setUrl('');
    setNotes('');
    setShowAddModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الحساب من الخزينة؟')) {
      saveAccounts(accounts.filter((a) => a.id !== id));
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleReveal = (id: string) => {
    setRevealedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const categories = [
    { id: 'all', label: 'الكل' },
    { id: 'dev', label: 'البرمجة والأنظمة' },
    { id: 'banking', label: 'البنوك والمال' },
    { id: 'ai', label: 'الذكاء الاصطناعي' },
    { id: 'social', label: 'التواصل الاجتماعي' },
    { id: 'study', label: 'الدراسة والجامعة' },
  ];

  const filtered = accounts.filter((a) => {
    const matchCat = selectedCat === 'all' || a.category === selectedCat;
    const matchSearch = 
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.username.toLowerCase().includes(search.toLowerCase()) ||
      (a.notes && a.notes.toLowerCase().includes(search.toLowerCase()));
    return matchCat && matchSearch;
  });

  return (
    <div className="flex flex-col h-full rounded-3xl apple-glass p-4 sm:p-5 overflow-hidden">
      
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-white/5 flex-shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <KeyRound className="h-4 w-4" />
            </div>
            <h2 className="text-base font-bold text-white">خزينة الحسابات والاشتراكات</h2>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            مساحة آمنة ومحمية لحفظ كافة حساباتك، مفاتيحك وكلمات مرورك في مكان واحد
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold transition-all shadow-[0_0_20px_rgba(16,185,129,0.25)] active:scale-95"
        >
          <Plus className="h-4 w-4 stroke-[3]" />
          <span>إضافة حساب جديد</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 mb-4 flex-shrink-0">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCat(c.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                selectedCat === c.id
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-white/[0.03] text-zinc-400 border border-white/5 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-60">
          <Search className="absolute right-3 top-2.5 h-3.5 w-3.5 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث في الحسابات..."
            className="w-full rounded-xl bg-white/[0.03] border border-white/10 pr-9 pl-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50"
          />
        </div>
      </div>

      {/* Accounts Grid List */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-3 min-h-0">
        {filtered.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-zinc-500 py-12">
            <Lock className="h-10 w-10 text-zinc-600 mb-2 stroke-[1.5]" />
            <p className="text-xs">لا توجد حسابات مسجلة في هذا التصنيف</p>
          </div>
        ) : (
          filtered.map((acc) => {
            const isRevealed = revealedIds[acc.id] || false;
            return (
              <div
                key={acc.id}
                className="apple-glass-card rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-white/5 hover:border-white/15"
              >
                {/* Account Details */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">{acc.name}</h3>
                    {acc.url && (
                      <a
                        href={acc.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-zinc-500 hover:text-emerald-400 transition-colors"
                        title="فتح الموقع"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                  
                  {acc.username && (
                    <div className="text-xs text-zinc-300 flex items-center gap-2">
                      <span className="text-zinc-500">اسم المستخدم/الإيميل:</span>
                      <span className="font-mono bg-white/[0.03] px-2 py-0.5 rounded border border-white/5 select-all">
                        {acc.username}
                      </span>
                    </div>
                  )}

                  {acc.notes && (
                    <p className="text-[11px] text-zinc-400">{acc.notes}</p>
                  )}
                </div>

                {/* Secret Key & Actions */}
                <div className="flex items-center gap-2 flex-wrap">
                  {acc.secret && (
                    <div className="flex items-center gap-1.5 rounded-xl bg-white/[0.04] border border-white/10 px-3 py-1.5">
                      <span className="text-xs font-mono text-emerald-300">
                        {isRevealed ? acc.secret : '••••••••••••'}
                      </span>
                      
                      <button
                        onClick={() => toggleReveal(acc.id)}
                        className="text-zinc-400 hover:text-white p-1"
                        title={isRevealed ? 'إخفاء' : 'إظهار'}
                      >
                        {isRevealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>

                      <button
                        onClick={() => handleCopy(acc.id, acc.secret)}
                        className="text-zinc-400 hover:text-emerald-400 p-1"
                        title="نسخ"
                      >
                        {copiedId === acc.id ? (
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => handleDelete(acc.id)}
                    className="p-2 rounded-xl text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="حذف"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Account Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="apple-glass-elevated w-full max-w-md rounded-3xl p-6 border border-white/10 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4 text-right">إضافة حساب أو اشتراك جديد</h3>
            
            <form onSubmit={handleAddAccount} className="space-y-3.5 text-right">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">اسم الحساب أو الخدمة:</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: محفظة بايبال، سيرفر لينكس، حساب جيميل"
                  className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">التصنيف:</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full rounded-xl bg-[#0e172a] border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="dev">البرمجة والأنظمة</option>
                    <option value="banking">البنوك والمال</option>
                    <option value="ai">الذكاء الاصطناعي</option>
                    <option value="social">التواصل الاجتماعي</option>
                    <option value="study">الدراسة والجامعة</option>
                    <option value="general">عام</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">رابط الموقع (اختياري):</label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">اسم المستخدم أو الإيميل:</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">كلمة المرور أو الرمز السري:</label>
                <input
                  type="text"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  placeholder="أدخل كلمة المرور أو رمز PIN أو المفتاح"
                  className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">ملاحظات أو أسئلة الأمان:</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="ملاحظات تذكرك بالبيانات..."
                  className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-white"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs shadow-md transition-all active:scale-95"
                >
                  حفظ في الخزينة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
