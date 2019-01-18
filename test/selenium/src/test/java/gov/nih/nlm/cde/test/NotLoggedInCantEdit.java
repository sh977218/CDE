package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class NotLoggedInCantEdit extends NlmCdeBaseTest {

    @Test
    public void notLoggedInCantEdit() {
        goToCdeByName("ALS Depression Inventory-12 (ADI-12) - lost abandoned scale");

        goToNaming();
        Assert.assertEquals(driver.findElements(By.xpath("//mat-icon[contains(., 'arrow_upward')]")).size(), 0);

        goToProperties();
        Assert.assertEquals(driver.findElements(By.xpath("//mat-icon[contains(., 'arrow_upward')]")).size(), 0);
    }

}
