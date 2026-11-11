// ============================================================================
// MOHA AGENT — RAPID OTA & DEVELOPMENT UPDATE ENGINE
// ============================================================================

export interface CommitInfo {
  sha: string;
  message: string;
  author: string;
  date: string;
}

export class SystemUpdaterEngine {
  private static REPO_URL = 'https://api.github.com/repos/moqrwled-cell/AqliyaHQ/commits/main';
  public static CURRENT_VERSION = 'v1.2.0-moha';

  /**
   * Fetch latest commit details from GitHub repo
   */
  public static async checkLatestUpdate(): Promise<{
    hasUpdate: boolean;
    latestCommit: CommitInfo | null;
    error: string | null;
  }> {
    try {
      const res = await fetch(this.REPO_URL, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      if (!res.ok) {
        return { hasUpdate: false, latestCommit: null, error: `GitHub API status ${res.status}` };
      }

      const data = await res.json();
      const commit: CommitInfo = {
        sha: data.sha?.substring(0, 7) || 'latest',
        message: data.commit?.message || 'تحديث برمجي جديد',
        author: data.commit?.author?.name || 'Moha Agent Team',
        date: data.commit?.author?.date || new Date().toISOString(),
      };

      const savedSha = localStorage.getItem('moha_last_applied_sha');
      const hasUpdate = Boolean(savedSha && savedSha !== commit.sha);

      return { hasUpdate, latestCommit: commit, error: null };
    } catch (e: any) {
      return { hasUpdate: false, latestCommit: null, error: e.message };
    }
  }

  /**
   * Fast In-App Cache Flush and Live Refresh
   */
  public static async applyLiveReload(sha?: string): Promise<void> {
    if (sha) {
      localStorage.setItem('moha_last_applied_sha', sha);
    }

    // Clear caches
    if (typeof window !== 'undefined' && 'caches' in window) {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      } catch (e) {
        // Continue
      }
    }

    // Force hard reload with timestamp query to bypass all WebView caches
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('_moha_update', Date.now().toString());
      window.location.href = url.toString();
    }
  }

  /**
   * Save Live Development Server URL (for instant phone updates over WiFi)
   */
  public static setLiveDevUrl(url: string): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('moha_live_dev_url', url.trim());
    }
  }

  public static getLiveDevUrl(): string | null {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('moha_live_dev_url');
    }
    return null;
  }
}
