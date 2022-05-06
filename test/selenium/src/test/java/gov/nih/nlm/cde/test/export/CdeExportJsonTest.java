package gov.nih.nlm.cde.test.export;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.TimeoutException;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;

public class CdeExportJsonTest extends NlmCdeBaseTest {
    @Test
    public void cdeExportJson() {
        String cdeName = "Spinal column injury number";
        loginAs(reguser_username,password);
        goToCdeByName(cdeName);

        downloadAsFile();
        clickElement(By.id("export"));
        clickElement(By.xpath("//*[@mat-menu-item][contains(.,'JSON File, NIH/CDE Schema')]"));
        checkAlert("Export downloaded.");
        String fileName = downloadFolder + "/7cDvUXR6SQe.json";
        waitForDownload(fileName);
        try {
            String actual = new String(Files.readAllBytes(Paths.get(fileName)));
            Assert.assertTrue(actual.contains("\"designations\":[{\"tags\":[\"Health\"],\"designation\":\"Spinal column injury number\""));
            Assert.assertTrue(actual.contains("\"definitions\":[{\"definition\":\"Number assigned to the spinal column injury. The spinal column injuries are assigned numbers starting with the most cephalic spinal column injury.\",\"tags\":[\"Health\"]"));
        } catch (IOException e) {
            e.printStackTrace();
            Assert.fail("Exception reading 7cDvUXR6SQe.json -- " + e);
        }

        downloadAsTab();
        clickElement(By.id("export"));
        clickElement(By.xpath("//*[@mat-menu-item][contains(.,'JSON File, NIH/CDE Schema')]"));
        switchTab(1);
        String response = findElement(By.cssSelector("HTML")).getAttribute("innerHTML");
        Assert.assertTrue(response.contains("\"designations\":[{\"tags\":[\"Health\"],\"designation\":\"Spinal column injury number\""));
        Assert.assertTrue(response.contains("\"definitions\":[{\"definition\":\"Number assigned to the spinal column injury. The spinal column injuries are assigned numbers starting with the most cephalic spinal column injury.\",\"tags\":[\"Health\"]"));
        switchTabAndClose(0);

        clickElement(By.id("export"));
        clickElement(By.xpath("//*[@mat-menu-item][contains(.,'JSON File, NIH/CDE Schema')]//a[mat-icon[contains(.,'help_outline')]]"));
        switchTab(1);
        response = findElement(By.cssSelector("HTML")).getAttribute("innerHTML");
        Assert.assertTrue(response.contains("\"source\":{\"type\":\"string\",\"description\":\"This field is replaced with sources\"},"));
        switchTabAndClose(0);
    }
}
