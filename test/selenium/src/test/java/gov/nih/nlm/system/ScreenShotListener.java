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
import java.io.InputStream;
import java.net.URL;
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
            File scrFile = ((TakesScreenshot) driver).getScreenshotAs(OutputType.FILE);
            try {
                FileUtils.copyFile(scrFile, new File("build/screenshots/" + methodName + "_" + formater.format(calendar.getTime()) + ".png"));
            } catch (IOException e1) {
                e1.printStackTrace();
            }
        }
        saveLogs(methodName);
        driver.get(NlmCdeBaseTest.baseUrl);
    }
    
    public void onTestSuccess(ITestResult itr) {
        String methodName = itr.getName();
        try {
            FileUtils.writeStringToFile(new File("build/testlogs/" + methodName + "_" + formater.format(calendar.getTime()) + ".txt"),
                    "mongo: " + new String(mongoStr) + "\nES: " + new String(esStr));
        } catch (IOException e1) {
            e1.printStackTrace();
        }
        saveLogs(methodName);
    }
    
    private void saveLogs(String methodName) {
        LogEntries logEntries = driver.manage().logs().get(LogType.BROWSER);
        StringBuilder sb = new StringBuilder();
        for (LogEntry entry : logEntries) {
            sb.append(new Date(entry.getTimestamp()) + " " + entry.getLevel() + " " + entry.getMessage() + "\n");
        }
        if (sb.length() > 0) {
            try {
                FileUtils.writeStringToFile(new File("build/consolelogs/" + methodName + "_" + formater.format(calendar.getTime()) + ".txt"), sb.toString());
            } catch (IOException e1) {
                System.out.println(e1);
                e1.printStackTrace();
            }
        }        
    }
    
}
