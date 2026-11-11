package com.aqliya.hq;

import android.content.Intent;
import android.os.Bundle;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private String pendingSharedText = null;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        handleSendIntent(getIntent());
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
                String extraText = intent.getStringExtra(Intent.EXTRA_TEXT);
                StringBuilder sb = new StringBuilder();
                if (subject != null && !subject.trim().isEmpty()) {
                    sb.append(subject.trim());
                }
                if (extraText != null && !extraText.trim().isEmpty()) {
                    if (sb.length() > 0 && !sb.toString().contains(extraText.trim())) {
                        sb.append("\n").append(extraText.trim());
                    } else if (sb.length() == 0) {
                        sb.append(extraText.trim());
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
