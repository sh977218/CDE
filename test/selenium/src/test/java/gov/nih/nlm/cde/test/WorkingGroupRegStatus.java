package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.util.List;

public class WorkingGroupRegStatus extends NlmCdeBaseTest {

    @Test
    public void wgRegStatus() {
        mustBeLoggedInAs(wguser_username, password);
        goToCdeByName("WG Test CDE");

        
        clickElement(By.id("editStatus"));
        List<WebElement> options = new Select(driver.findElement(By.name("registrationStatus"))).getOptions();
        for (WebElement option : options) {
            Assert.assertNotEquals("Qualified", option.getText());
            Assert.assertNotEquals("Recorded", option.getText());
        }
        clickElement(By.id("cancelRegStatus"));
        modalGone();
    }

}
