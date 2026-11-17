package com.aqliya.hq;

import android.app.Notification;
import android.os.Bundle;
import android.service.notification.NotificationListenerService;
import android.service.notification.StatusBarNotification;
import android.util.Log;

public class MohaNotificationListenerService extends NotificationListenerService {
    private static final String TAG = "MohaNotifListener";

    @Override
    public void onNotificationPosted(StatusBarNotification sbn) {
        if (sbn == null || sbn.getNotification() == null) return;

        try {
            String pkg = sbn.getPackageName();
            if (pkg == null) return;

            Notification notification = sbn.getNotification();
            Bundle extras = notification.extras;
            if (extras == null) return;

            CharSequence titleCs = extras.getCharSequence(Notification.EXTRA_TITLE);
            CharSequence textCs = extras.getCharSequence(Notification.EXTRA_TEXT);
            CharSequence bigTextCs = extras.getCharSequence(Notification.EXTRA_BIG_TEXT);

            String title = titleCs != null ? titleCs.toString() : "";
            String text = bigTextCs != null ? bigTextCs.toString() : (textCs != null ? textCs.toString() : "");

            String combined = (title + " " + text).toLowerCase();

            // Filter for Google Classroom, Gmail, or College Assignment keywords
            boolean isClassroom = pkg.contains("classroom") || combined.contains("classroom") || combined.contains("كلاس روم");
            boolean isGmail = pkg.equals("com.google.android.gm");
            boolean isAcademicTask = combined.contains("تكليف") || combined.contains("واجب") || 
                                     combined.contains("امتحان") || combined.contains("تسليم") || 
                                     combined.contains("اختبار") || combined.contains("assignment") ||
                                     combined.contains("due ");

            if (isClassroom || (isGmail && isAcademicTask) || isAcademicTask) {
                Log.d(TAG, "Academic notification intercepted: " + pkg + " | " + title);
                MainActivity.dispatchNotificationToWeb(pkg, title, text);
            }

        } catch (Exception e) {
            Log.e(TAG, "Error handling notification", e);
        }
    }

    @Override
    public void onNotificationRemoved(StatusBarNotification sbn) {
        // No action needed on dismiss
    }
}
