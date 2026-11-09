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
                String text = intent.getStringExtra(Intent.EXTRA_TEXT);
                if (text == null || text.trim().isEmpty()) {
                    text = intent.getStringExtra(Intent.EXTRA_SUBJECT);
                }
                if (text != null && !text.trim().isEmpty()) {
                    this.pendingSharedText = text.trim();
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
