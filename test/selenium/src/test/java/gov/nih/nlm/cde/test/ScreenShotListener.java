/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

package gov.nih.nlm.cde.test;

import static gov.nih.nlm.cde.test.NlmCdeBaseTest.driver;
import java.io.File;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import org.apache.commons.io.FileUtils;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.logging.LogEntries;
import org.openqa.selenium.logging.LogEntry;
import org.openqa.selenium.logging.LogType;
import org.testng.ITestResult;
import org.testng.TestListenerAdapter;

/**
 *
 * @author ludetc
 */
public class ScreenShotListener extends TestListenerAdapter {
    
    public void onTestFailure(ITestResult itr) {
        Calendar calendar = Calendar.getInstance();
        SimpleDateFormat formater = new SimpleDateFormat("dd_MM_yyyy_hh_mm_ss");
        String methodName = itr.getName();
        if (!itr.isSuccess()) {
            File scrFile = ((TakesScreenshot) driver).getScreenshotAs(OutputType.FILE);
            try {
                FileUtils.copyFile(scrFile, new File("build/screenshots/" + methodName + "_" + formater.format(calendar.getTime()) + ".png"));
            } catch (IOException e1) {
                e1.printStackTrace();
            }
        }
        LogEntries logEntries = driver.manage().logs().get(LogType.BROWSER);
        StringBuilder sb = new StringBuilder();
        for (LogEntry entry : logEntries) {
            sb.append(new Date(entry.getTimestamp()) + " " + entry.getLevel() + " " + entry.getMessage() + "\n");
        }
        if (sb.length() > 0) {
            try {
                FileUtils.writeStringToFile(new File("build/consolelogs/" + methodName + "_" + formater.format(calendar.getTime()) + ".txt"), sb.toString());
            } catch (IOException e1) {
                e1.printStackTrace();
            }
        }
    }
    
}
