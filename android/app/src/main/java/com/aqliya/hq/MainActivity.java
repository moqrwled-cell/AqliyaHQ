package com.aqliya.hq;

import android.content.Intent;
import android.os.Bundle;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    public static MainActivity instance = null;
    private String pendingSharedText = null;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        instance = this;
        handleSendIntent(getIntent());
    }

    @Override
    protected void onDestroy() {
        if (instance == this) {
            instance = null;
        }
        super.onDestroy();
    }

    public static void dispatchNotificationToWeb(final String pkg, final String title, final String text) {
        if (instance != null && instance.getBridge() != null && instance.getBridge().getWebView() != null) {
            instance.getBridge().getWebView().post(new Runnable() {
                @Override
                public void run() {
                    try {
                        String cleanPkg = pkg == null ? "" : pkg.replace("\\", "\\\\").replace("\"", "\\\"");
                        String cleanTitle = title == null ? "" : title.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "");
                        String cleanText = text == null ? "" : text.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "");
                        
                        String js = "if (window.onAqliyaNotificationReceived) { window.onAqliyaNotificationReceived({ package: \"" + cleanPkg + "\", title: \"" + cleanTitle + "\", text: \"" + cleanText + "\" }); }";
                        instance.getBridge().getWebView().evaluateJavascript(js, null);
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }
            });
        }
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        handleSendIntent(intent);
        dispatchSharedText();
    }

    private void handleSendIntent(Intent intent) {
        if (intent != null && Intent.ACTION_SEND.equals(intent.getAction())) {
            String type = intent.getType();
            if (type != null && ("text/plain".equals(type) || type.startsWith("text/"))) {
                String subject = intent.getStringExtra(Intent.EXTRA_SUBJECT);
                String title = intent.getStringExtra(Intent.EXTRA_TITLE);
                String extraText = intent.getStringExtra(Intent.EXTRA_TEXT);
                
                StringBuilder sb = new StringBuilder();
                if (title != null && !title.trim().isEmpty()) {
                    sb.append(title.trim());
                }
                if (subject != null && !subject.trim().isEmpty() && !sb.toString().contains(subject.trim())) {
                    if (sb.length() > 0) sb.append("\n");
                    sb.append(subject.trim());
                }
                if (extraText != null && !extraText.trim().isEmpty() && !sb.toString().contains(extraText.trim())) {
                    if (sb.length() > 0) sb.append("\n");
                    sb.append(extraText.trim());
                }

                // Also inspect ClipData for captions, titles or URLs passed by Instagram/TikTok/YouTube
                if (intent.getClipData() != null) {
                    for (int i = 0; i < intent.getClipData().getItemCount(); i++) {
                        CharSequence clipText = intent.getClipData().getItemAt(i).getText();
                        if (clipText != null && clipText.length() > 0) {
                            String itemStr = clipText.toString().trim();
                            if (!itemStr.isEmpty() && !sb.toString().contains(itemStr)) {
                                if (sb.length() > 0) sb.append("\n");
                                sb.append(itemStr);
                            }
                        }
                    }
                }

                String result = sb.toString().trim();
                if (!result.isEmpty()) {
                    this.pendingSharedText = result;
                }
            }
        }
    }

    private void dispatchSharedText() {
        if (pendingSharedText != null && getBridge() != null && getBridge().getWebView() != null) {
            final String textToSend = pendingSharedText;
            pendingSharedText = null;

            getBridge().getWebView().post(new Runnable() {
                @Override
                public void run() {
                    try {
                        String escaped = textToSend
                            .replace("\\", "\\\\")
                            .replace("\"", "\\\"")
                            .replace("\n", "\\n")
                            .replace("\r", "");
                        
                        // Execute JavaScript dispatch
                        String js = "if (window.onAqliyaSharedText) { window.onAqliyaSharedText(\"" + escaped + "\"); } else { window.__AQLIYA_INITIAL_SHARE__ = \"" + escaped + "\"; }";
                        getBridge().getWebView().evaluateJavascript(js, null);
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }
            });
        }
    }

    @Override
    public void onResume() {
        super.onResume();
        if (pendingSharedText != null) {
            if (getBridge() != null && getBridge().getWebView() != null) {
                getBridge().getWebView().postDelayed(new Runnable() {
                    @Override
                    public void run() {
                        dispatchSharedText();
                    }
                }, 800);
            }
        }
    }
}
