package gov.nih.nlm.system;

import org.apache.commons.io.FileUtils;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.logging.LogEntries;
import org.openqa.selenium.logging.LogEntry;
import org.openqa.selenium.logging.LogType;
import org.testng.ITestResult;
import org.testng.TestListenerAdapter;
import javax.imageio.ImageIO;
import ru.yandex.qatools.ashot.AShot;
import ru.yandex.qatools.ashot.Screenshot;
import ru.yandex.qatools.ashot.shooting.ShootingStrategies;

import java.io.File;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;

import static gov.nih.nlm.system.NlmCdeBaseTest.driver;

public class ScreenShotListener extends TestListenerAdapter {
    private SimpleDateFormat formater = new SimpleDateFormat("dd_MM_yyyy_hh_mm_ss");
    private Calendar calendar = Calendar.getInstance();

    public void onTestFailure(ITestResult itr) {
        String methodName = itr.getName();
        System.out.println("Test Fail: " + methodName);
        if (!itr.isSuccess()) {
            try {
                FileUtils.writeStringToFile(new File("build/htmlSnapshots/" + methodName +
                                "_HTML_" + formater.format(calendar.getTime())+ ".html"),
                        driver.getPageSource(), "UTF-8");

                File srcFile = ((TakesScreenshot) driver).getScreenshotAs(OutputType.FILE);
                FileUtils.copyFile(srcFile,
                        new File("build/screenshots/" + methodName + "_" + formater.format(calendar.getTime()) + ".png"));

                Screenshot fpScreenshot = new AShot().shootingStrategy(ShootingStrategies.viewportPasting(1000)).takeScreenshot(driver);
                ImageIO.write(fpScreenshot.getImage(),"PNG", new File("build/screenshots/" +
                        methodName + "_FULL_" + formater.format(calendar.getTime()) + ".png"));
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        try {
            saveLogs(methodName, "URL when failed: " + driver.getCurrentUrl());
        } catch (Exception e) {
            e.printStackTrace();
        }

        try {
            driver.get(NlmCdeBaseTest.baseUrl);
            System.out.println("Alert TEXT: " + driver.switchTo().alert().getText());
        } catch(Exception e) {
            System.out.println("Could not switch to alert");
        }

    }

    public void onTestSuccess(ITestResult itr) {
        String methodName = itr.getName();
        try {
            saveLogs(methodName, null);
        } catch (Exception e) {
        }
    }

    private void saveLogs(String methodName, String extraText) {
        LogEntries logEntries = driver.manage().logs().get(LogType.BROWSER);
        StringBuilder sb = new StringBuilder();
        if (extraText != null) {
            sb.append("URL when failed: " + driver.getCurrentUrl() + "\n");
        }
        for (LogEntry entry : logEntries) {
            if (!entry.getMessage().contains(":3001/server/de/originalSource")
            && !entry.getMessage().contains(":3001/server/form/originalSource")) {
                sb.append(new Date(entry.getTimestamp()));
                sb.append(" ");
                sb.append(entry.getLevel());
                sb.append(" ");
                sb.append(entry.getMessage());
                sb.append("\n");
            }

        }
        if (sb.length() > 0) {
            try {
                FileUtils.writeStringToFile(
                        new File("build/consolelogs/" + methodName + "_" + formater.format(calendar.getTime()) + ".txt"),
                        sb.toString(), "UTF-8");
            } catch (IOException e1) {
                e1.printStackTrace();
            }
        }
    }

}
