package gov.nih.nlm.cde.test.export;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class CdeExportJsonTest extends NlmCdeBaseTest {
    @Test
    public void cdeExportJson() {
        String cdeName = "Spinal column injury number";
        goToCdeByName(cdeName);
        clickElement(By.id("export"));
        clickElement(By.id("jsonExport"));
        switchTab(1);
        String response = findElement(By.cssSelector("HTML")).getAttribute("innerHTML");
        Assert.assertTrue(response.contains("\"naming\":[{\"designation\":\"Spinal column injury number\",\"definition\":\"Number assigned to the spinal column injury. The spinal column injuries are assigned numbers starting with the most cephalic spinal column injury.\""));
        switchTabAndClose(0);
    }
}
