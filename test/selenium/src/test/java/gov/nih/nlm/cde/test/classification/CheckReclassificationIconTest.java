
package gov.nih.nlm.cde.test.classification;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.util.List;

public class CheckReclassificationIconTest extends NlmCdeBaseTest {
    @Test
    public void checkReclassificationIcon() {
        mustBeLoggedInAs(ninds_username, password);

        // Check icons appear on classification management page
        gotoClassificationMgt();
        List<WebElement> icons = driver.findElements(By.xpath("//mat-icon[normalize-space() = 'transform']"));
        Assert.assertTrue(icons.size() > 1);

        // Check icons don't appear on CDE detail page
        String cdeName = "Brief Symptom Inventory-18 (BSI18)- Anxiety raw score";
        goToCdeByName(cdeName);
        goToClassification();
        icons = driver.findElements(By.xpath("//mat-icon[normalize-space() = 'transform']"));
        Assert.assertTrue(icons.isEmpty());
    }
}
