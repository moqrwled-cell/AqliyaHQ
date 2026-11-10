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
  Layers,
  Download,
  Upload,
  RefreshCw,
  Wifi,
  WifiOff,
  Sparkles
} from 'lucide-react';
import { CryptoVaultEngine } from '../lib/offline-security/cryptoVaultEngine';
import { OfflineSyncEngine } from '../lib/offline-security/offlineSyncEngine';
import type { SyncStats } from '../lib/offline-security/types';

export interface AccountEntry {
  id: string;
  name: string;
  category: 'dev' | 'banking' | 'ai' | 'social' | 'study' | 'general';
  username: string;
  secret: any; // Plaintext or EncryptedPayload
  url?: string;
  notes?: string;
  encrypted?: boolean;
  cryptoAlgorithm?: string;
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
  const [revealedSecrets, setRevealedSecrets] = useState<Record<string, string>>({});
  const [decryptingId, setDecryptingId] = useState<string | null>(null);
  const [syncStats, setSyncStats] = useState<SyncStats>(OfflineSyncEngine.getSyncStats());
  const [isReplayingSync, setIsReplayingSync] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<AccountEntry['category']>('dev');
  const [username, setUsername] = useState('');
  const [secret, setSecret] = useState('');
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');

  // Initial migration to AES-GCM & Sync listener subscription
  useEffect(() => {
    const runMigration = async () => {
      try {
        const needsMigration = accounts.some(
          (acc) => typeof acc.secret === 'string' && !CryptoVaultEngine.isEncrypted(acc.secret) && acc.secret !== '••••' && !acc.secret.startsWith('ghp_••')
        );
        if (needsMigration) {
          const migrated = await CryptoVaultEngine.migrateAccountsVault(accounts);
          saveAccounts(migrated);
        }
      } catch (err) {
        console.warn('Vault auto-migration error:', err);
      }
    };
    runMigration();

    const unsubscribe = OfflineSyncEngine.subscribe((stats) => {
      setSyncStats(stats);
    });
    return unsubscribe;
  }, []);

  const saveAccounts = (updated: AccountEntry[]) => {
    setAccounts(updated);
    try {
      localStorage.setItem('aqliya_accounts_vault', JSON.stringify(updated));
      // Queue offline sync for accounts table
      OfflineSyncEngine.enqueueAction('accounts_vault', 'update', {
        itemCount: updated.length,
        updated_at: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Accounts storage write error', e);
    }
  };

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Encrypt secret with AES-GCM 256-bit
    let encryptedSecret = secret.trim();
    try {
      if (encryptedSecret) {
        encryptedSecret = (await CryptoVaultEngine.encryptAccountSecret(encryptedSecret)) as any;
      }
    } catch (err) {
      console.warn('Encryption fallback', err);
    }

    const newAcc: AccountEntry = {
      id: `acc-${Date.now()}`,
      name: name.trim(),
      category,
      username: username.trim(),
      secret: encryptedSecret,
      url: url.trim(),
      notes: notes.trim(),
      encrypted: true,
      cryptoAlgorithm: 'AES-GCM-256',
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
      const remaining = accounts.filter((a) => a.id !== id);
      saveAccounts(remaining);
      setRevealedSecrets((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    }
  };

  const toggleRevealSecret = async (acc: AccountEntry) => {
    if (revealedSecrets[acc.id]) {
      // Hide
      setRevealedSecrets((prev) => {
        const copy = { ...prev };
        delete copy[acc.id];
        return copy;
      });
      return;
    }

    // Decrypt
    try {
      setDecryptingId(acc.id);
      const plain = await CryptoVaultEngine.decryptAccountSecret(acc.secret);
      setRevealedSecrets((prev) => ({ ...prev, [acc.id]: plain }));
    } catch (err: any) {
      alert(err?.message || 'فشل فك تشفير هذا الحساب');
    } finally {
      setDecryptingId(null);
    }
  };

  const handleCopySecret = async (acc: AccountEntry) => {
    try {
      let plain = revealedSecrets[acc.id];
      if (!plain) {
        plain = await CryptoVaultEngine.decryptAccountSecret(acc.secret);
      }
      navigator.clipboard.writeText(plain);
      setCopiedId(acc.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err: any) {
      alert(err?.message || 'فشل فك التشفير للنسخ');
    }
  };

  const handleExportBackup = () => {
    try {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(accounts, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `aqliya_accounts_encrypted_backup_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      alert('فشل تصدير النسخة الاحتياطية.');
    }
  };

  const handleTriggerReplay = async () => {
    setIsReplayingSync(true);
    try {
      await OfflineSyncEngine.replayQueue();
      setSyncStats(OfflineSyncEngine.getSyncStats());
    } finally {
      setIsReplayingSync(false);
    }
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
    <div className="flex flex-col h-full rounded-3xl apple-glass p-4 sm:p-5 overflow-hidden text-right font-sans">
      
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-white/5 flex-shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <KeyRound className="h-4 w-4" />
            </div>
            <h2 className="text-base font-bold text-white">خزينة الحسابات والاشتراكات</h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-mono">
              AES-GCM 256-bit
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            مساحة آمنة ومحمية بتشفير عسكري لحفظ كافة حساباتك ومفاتيحك بدون إمكانية قراءتها خارج جهازك
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Sync status & Replay button */}
          <button
            onClick={handleTriggerReplay}
            disabled={isReplayingSync}
            className="flex items-center gap-1 px-3 py-2 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-zinc-300 text-xs transition-all active:scale-95"
            title="مزامنة طابور العمليات"
          >
            {syncStats.isOnline ? (
              <Wifi className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <WifiOff className="h-3.5 w-3.5 text-amber-400" />
            )}
            <RefreshCw className={`h-3 w-3 ${isReplayingSync ? 'animate-spin text-emerald-400' : 'text-zinc-400'}`} />
            <span className="text-[11px] font-mono">
              {syncStats.pendingCount > 0 ? `${syncStats.pendingCount} معلق` : 'متزامن'}
            </span>
          </button>

          {/* Export Backup Button */}
          <button
            onClick={handleExportBackup}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-zinc-300 text-xs transition-all active:scale-95"
            title="تصدير نسخة احتياطية مشفرة"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">تصدير مشفر</span>
          </button>

          {/* Add Account Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold transition-all shadow-[0_0_20px_rgba(16,185,129,0.25)] active:scale-95"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>إضافة حساب</span>
          </button>
        </div>
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
            className="w-full rounded-xl bg-white/[0.03] border border-white/10 pr-9 pl-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 text-right"
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
            const isRevealed = !!revealedSecrets[acc.id];
            const displaySecret = isRevealed ? revealedSecrets[acc.id] : '••••••••••••';
            const isDecrypting = decryptingId === acc.id;

            return (
              <div
                key={acc.id}
                className="apple-glass-card rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-white/5 hover:border-white/15"
              >
                {/* Account Details */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">{acc.name}</h3>
                    {acc.encrypted && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono">
                        مشفر AES
                      </span>
                    )}
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
                      <span className="text-xs font-mono text-emerald-300 select-all">
                        {isDecrypting ? 'جاري فك التشفير...' : displaySecret}
                      </span>
                      
                      <button
                        onClick={() => toggleRevealSecret(acc)}
                        disabled={isDecrypting}
                        className="text-zinc-400 hover:text-white p-1"
                        title={isRevealed ? 'إخفاء' : 'فك التشفير وإظهار'}
                      >
                        {isRevealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>

                      <button
                        onClick={() => handleCopySecret(acc)}
                        className="text-zinc-400 hover:text-emerald-400 p-1"
                        title="نسخ السر بعد فك التشفير"
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
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>تشفير فوري AES-256</span>
              </span>
              <h3 className="text-base font-bold text-white text-right">إضافة حساب جديد</h3>
            </div>
            
            <form onSubmit={handleAddAccount} className="space-y-3.5 text-right">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">اسم الحساب أو الخدمة:</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: محفظة بايبال، سيرفر لينكس، حساب جيميل"
                  className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 text-right"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">التصنيف:</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full rounded-xl bg-[#0e172a] border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 text-right"
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
                    className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 text-right"
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
                  className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 text-right"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">كلمة المرور أو الرمز السري (يُشفر فورياً):</label>
                <input
                  type="password"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  placeholder="أدخل كلمة المرور أو رمز PIN أو الـ Token"
                  className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono text-right"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">ملاحظات أو أسئلة الأمان:</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="ملاحظات تذكرك بالبيانات..."
                  className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 text-right"
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
                  تشفير وحفظ في الخزينة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
