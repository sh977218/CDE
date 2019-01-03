package gov.nih.nlm.cde.test.export;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.TimeoutException;
import org.testng.Assert;
import org.testng.annotations.Test;

public class CdeExportJsonTest extends NlmCdeBaseTest {
    @Test
    public void cdeExportJson() {
        String cdeName = "Spinal column injury number";
        goToCdeByName(cdeName);
        try {
            clickElement(By.id("export"));
            clickElement(By.id("jsonExport"));
        } catch (TimeoutException e) {
            clickElement(By.id("export"));
            clickElement(By.id("jsonExport"));
        }
        switchTab(1);
        String response = findElement(By.cssSelector("HTML")).getAttribute("innerHTML");
        Assert.assertTrue(response.contains("\"designations\":[{\"tags\":[\"Health\"],\"designation\":\"Spinal column injury number\""));
        Assert.assertTrue(response.contains("\"definitions\":[{\"tags\":[\"Health\"],\"definition\":\"Number assigned to the spinal column injury. The spinal column injuries are assigned numbers starting with the most cephalic spinal column injury.\""));
        switchTabAndClose(0);

        clickElement(By.id("export"));
        clickElement(By.cssSelector("#jsonExport + a"));
        switchTab(1);
        response = findElement(By.cssSelector("HTML")).getAttribute("innerHTML");
        Assert.assertTrue(response.contains("\"source\":{\"type\":\"string\",\"description\":\"This field is replaced with sources\"},"));
        switchTabAndClose(0);
    }
}
