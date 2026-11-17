// ============================================================================
// MOHA AGENT — OFFICIAL & INNOVATIVE UPDATE ENGINE
// Combines Official 1-Tap APK Downloads from GitHub Releases,
// Live Cloud Mirroring (instant push-to-app updates), and Wi-Fi Live Dev Bridge
// ============================================================================

export interface CommitInfo {
  sha: string;
  message: string;
  author: string;
  date: string;
}

export interface ReleaseInfo {
  tagName: string;
  releaseName: string;
  publishedAt: string;
  apkDownloadUrl: string;
  htmlUrl: string;
  body: string;
}

export type AppRuntimeMode = 'native_local' | 'cloud_mirror' | 'wifi_dev';

export class SystemUpdaterEngine {
  public static CURRENT_VERSION = 'v1.3.0 (Build 2026)';
  public static GITHUB_REPO = 'moqrwled-cell/AqliyaHQ';
  public static REPO_COMMITS_URL = 'https://api.github.com/repos/moqrwled-cell/AqliyaHQ/commits/main';
  public static REPO_RELEASES_URL = 'https://api.github.com/repos/moqrwled-cell/AqliyaHQ/releases/latest';
  public static DIRECT_APK_URL = 'https://github.com/moqrwled-cell/AqliyaHQ/releases/latest/download/AqliyaHQ-Android-v1.0.apk';
  public static RELEASES_PAGE_URL = 'https://github.com/moqrwled-cell/AqliyaHQ/releases';

  private static STORAGE_KEY_MODE = 'moha_app_runtime_mode_v1';
  private static STORAGE_KEY_CUSTOM_URL = 'moha_custom_runtime_url_v1';
  private static STORAGE_KEY_LAST_SHA = 'moha_last_known_sha_v1';

  /**
   * Fetch comprehensive update details (Latest Commit + Latest Release APK)
   */
  public static async checkLatestUpdate(): Promise<{
    hasUpdate: boolean;
    latestCommit: CommitInfo | null;
    latestRelease: ReleaseInfo | null;
    error: string | null;
  }> {
    let latestCommit: CommitInfo | null = null;
    let latestRelease: ReleaseInfo | null = null;
    let error: string | null = null;

    // 1. Fetch Latest Commit
    try {
      const commitRes = await fetch(this.REPO_COMMITS_URL, {
        headers: { Accept: 'application/vnd.github.v3+json' },
      });
      if (commitRes.ok) {
        const data = await commitRes.json();
        latestCommit = {
          sha: data.sha ? data.sha.substring(0, 7) : 'latest',
          message: data.commit?.message ? data.commit.message.split('\n')[0] : 'تحديث برمجي جديد',
          author: data.commit?.author?.name || 'Moha Agent Team',
          date: data.commit?.author?.date || new Date().toISOString(),
        };
      }
    } catch (e: any) {
      error = e.message;
    }

    // 2. Fetch Latest GitHub Release APK
    try {
      const releaseRes = await fetch(this.REPO_RELEASES_URL, {
        headers: { Accept: 'application/vnd.github.v3+json' },
      });
      if (releaseRes.ok) {
        const rData = await releaseRes.json();
        let downloadUrl = this.DIRECT_APK_URL;
        if (rData.assets && Array.isArray(rData.assets) && rData.assets.length > 0) {
          const apkAsset = rData.assets.find((a: any) => a.name && a.name.endsWith('.apk'));
          if (apkAsset && apkAsset.browser_download_url) {
            downloadUrl = apkAsset.browser_download_url;
          }
        }
        latestRelease = {
          tagName: rData.tag_name || 'v1.0.0',
          releaseName: rData.name || 'إصدار أندرويد رسمي',
          publishedAt: rData.published_at || new Date().toISOString(),
          apkDownloadUrl: downloadUrl,
          htmlUrl: rData.html_url || this.RELEASES_PAGE_URL,
          body: rData.body || '',
        };
      }
    } catch (e: any) {
      // Keep release fallback
    }

    const savedSha = localStorage.getItem(this.STORAGE_KEY_LAST_SHA);
    const hasUpdate = Boolean(latestCommit && savedSha && savedSha !== latestCommit.sha);

    return { hasUpdate, latestCommit, latestRelease, error };
  }

  /**
   * Triggers direct official APK download and prompts Android package installer
   */
  public static downloadLatestApk(customUrl?: string): void {
    const url = customUrl || this.DIRECT_APK_URL;
    if (typeof window !== 'undefined') {
      // Mark as downloaded
      window.open(url, '_blank');
    }
  }

  /**
   * Opens the official GitHub Releases page
   */
  public static openReleasesPage(): void {
    if (typeof window !== 'undefined') {
      window.open(this.RELEASES_PAGE_URL, '_blank');
    }
  }

  /**
   * Get Current Runtime App Mode
   */
  public static getRuntimeMode(): {
    mode: AppRuntimeMode;
    customUrl: string | null;
    isNativeLocal: boolean;
  } {
    const mode = (localStorage.getItem(this.STORAGE_KEY_MODE) as AppRuntimeMode) || 'native_local';
    const customUrl = localStorage.getItem(this.STORAGE_KEY_CUSTOM_URL);
    return {
      mode,
      customUrl,
      isNativeLocal: mode === 'native_local',
    };
  }

  /**
   * Switch between:
   * 1. 'native_local': offline bundled APK assets
   * 2. 'cloud_mirror': live deployed web URL (zero-install instant updates!)
   * 3. 'wifi_dev': local Wi-Fi IP address (live reload while coding)
   */
  public static switchRuntimeMode(mode: AppRuntimeMode, targetUrl?: string): void {
    localStorage.setItem(this.STORAGE_KEY_MODE, mode);

    if (mode === 'native_local') {
      localStorage.removeItem(this.STORAGE_KEY_CUSTOM_URL);
      // Hard reload to internal local files
      const baseLocal = window.location.origin + window.location.pathname;
      window.location.href = baseLocal;
      return;
    }

    if (targetUrl && targetUrl.trim()) {
      let finalUrl = targetUrl.trim();
      if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
        finalUrl = `https://${finalUrl}`;
      }
      localStorage.setItem(this.STORAGE_KEY_CUSTOM_URL, finalUrl);
      window.location.href = finalUrl;
    }
  }

  /**
   * Fast In-App Cache Flush & Hard Reload
   */
  public static async applyLiveReload(sha?: string): Promise<void> {
    if (sha) {
      localStorage.setItem(this.STORAGE_KEY_LAST_SHA, sha);
    }

    if (typeof window !== 'undefined' && 'caches' in window) {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      } catch (e) {}
    }

    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('_moha_cache_bust', Date.now().toString());
      window.location.href = url.toString();
    }
  }
}
