// ============================================================================
// AQLIYA HQ — CLEAN OFFICIAL APK UPDATER ENGINE
// Direct GitHub Releases check & 1-tap APK download
// ============================================================================

export interface ReleaseInfo {
  tagName: string;
  releaseName: string;
  publishedAt: string;
  apkDownloadUrl: string;
  htmlUrl: string;
  body: string;
}

export class SystemUpdaterEngine {
  public static CURRENT_VERSION = 'v1.0.0 (Build 37)';
  public static GITHUB_REPO = 'moqrwled-cell/AqliyaHQ';
  public static REPO_RELEASES_URL = 'https://api.github.com/repos/moqrwled-cell/AqliyaHQ/releases/latest';
  public static DIRECT_APK_URL = 'https://github.com/moqrwled-cell/AqliyaHQ/releases/latest/download/AqliyaHQ-Android-v1.0.apk';
  public static RELEASES_PAGE_URL = 'https://github.com/moqrwled-cell/AqliyaHQ/releases';

  /**
   * Check latest official release from GitHub
   */
  public static async checkLatestRelease(): Promise<{
    hasUpdate: boolean;
    release: ReleaseInfo | null;
    error: string | null;
  }> {
    try {
      const res = await fetch(this.REPO_RELEASES_URL, {
        headers: { Accept: 'application/vnd.github.v3+json' },
      });

      if (res.ok) {
        const data = await res.json();
        let apkUrl = this.DIRECT_APK_URL;
        if (data.assets && Array.isArray(data.assets) && data.assets.length > 0) {
          const asset = data.assets.find((a: any) => a.name && a.name.endsWith('.apk'));
          if (asset && asset.browser_download_url) {
            apkUrl = asset.browser_download_url;
          }
        }

        const release: ReleaseInfo = {
          tagName: data.tag_name || 'v1.0.0',
          releaseName: data.name || 'إصدار أندرويد رسمي',
          publishedAt: data.published_at || new Date().toISOString(),
          apkDownloadUrl: apkUrl,
          htmlUrl: data.html_url || this.RELEASES_PAGE_URL,
          body: data.body || '',
        };

        const hasUpdate = release.tagName !== this.CURRENT_VERSION;
        return { hasUpdate, release, error: null };
      }
      return { hasUpdate: false, release: null, error: `GitHub API: ${res.statusText}` };
    } catch (e: any) {
      return { hasUpdate: false, release: null, error: e.message || 'تعذر الاتصال بالخادم' };
    }
  }

  /**
   * Open direct APK download in system browser / package installer
   */
  public static downloadLatestApk(url?: string): void {
    const target = url || this.DIRECT_APK_URL;
    if (typeof window !== 'undefined') {
      window.open(target, '_blank');
    }
  }
}
