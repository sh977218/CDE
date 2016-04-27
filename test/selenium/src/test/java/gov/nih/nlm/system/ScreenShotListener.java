package gov.nih.nlm.system;

import org.apache.commons.io.FileUtils;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.logging.LogEntries;
import org.openqa.selenium.logging.LogEntry;
import org.openqa.selenium.logging.LogType;
import org.testng.ITestResult;
import org.testng.TestListenerAdapter;

import java.io.File;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;

import static gov.nih.nlm.system.NlmCdeBaseTest.driver;

public class ScreenShotListener extends TestListenerAdapter {
    SimpleDateFormat formater = new SimpleDateFormat("dd_MM_yyyy_hh_mm_ss");
    Calendar calendar = Calendar.getInstance();

    public void onTestFailure(ITestResult itr) {
        String methodName = itr.getName();
        if (!itr.isSuccess()) {
            try {
                File scrFile = ((TakesScreenshot) driver).getScreenshotAs(OutputType.FILE);
                FileUtils.copyFile(scrFile,
                        new File("build/screenshots/" + methodName + "_" + formater.format(calendar.getTime()) + ".png"));
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        saveLogs(methodName, "URL when failed: " + driver.getCurrentUrl());
        try {
            driver.get(NlmCdeBaseTest.baseUrl);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public void onTestSuccess(ITestResult itr) {
        String methodName = itr.getName();
        saveLogs(methodName, null);
    }

    private void saveLogs(String methodName, String extraText) {
        LogEntries logEntries = driver.manage().logs().get(LogType.BROWSER);
        StringBuilder sb = new StringBuilder();
        if (extraText != null) {
            sb.append("URL when failed: " + driver.getCurrentUrl());
        }
        for (LogEntry entry : logEntries) {
            if (!entry.getMessage().contains("Range.detach"))
                sb.append(new Date(entry.getTimestamp()));
            sb.append(" ");
            sb.append(entry.getLevel());
            sb.append(" ");
            sb.append(entry.getMessage());
            sb.append("\n");
        }
        if (sb.length() > 0) {
            try {
                FileUtils.writeStringToFile(
                        new File("build/consolelogs/" + methodName + "_" + formater.format(calendar.getTime()) + ".txt"), sb.toString());
            } catch (IOException e1) {
                e1.printStackTrace();
            }
        }
    }

}
