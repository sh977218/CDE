package gov.nih.nlm.cde.test;

import static gov.nih.nlm.cde.test.NlmCdeBaseTest.driver;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
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
    
    public void onTestSuccess(ITestResult itr) {
        String methodName = itr.getName();
        try {
            InputStream response = new URL("http://localhost:9200/cdetest/_count").openStream();
            byte [] esStr = new byte[100];
            response.read(esStr);
            
            response = new URL("http://localhost:3001/deCount").openStream();
            byte [] mongoStr = new byte[100];
            response.read(mongoStr);
            
            FileUtils.writeStringToFile(new File("build/testlogs/" + methodName + "_" + formater.format(calendar.getTime()) + ".txt"),
                    "mongo: " + new String(mongoStr) + "\nES: " + new String(esStr));
        } catch (IOException e1) {
            e1.printStackTrace();
        }
    }
    
}
