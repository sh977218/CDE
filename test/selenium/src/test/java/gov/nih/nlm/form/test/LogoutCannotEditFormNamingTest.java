package gov.nih.nlm.form.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.testng.Assert;
import org.testng.annotations.Test;

public class LogoutCannotEditFormNamingTest extends NlmCdeBaseTest {

    @Test
    public void logoutCannotEditNaming() {
        String formName = "Study Drug Compliance";
        goToFormByName(formName);
        goToNaming();
        for (WebElement elt : driver.findElements(By.xpath("//mat-icon[normalize-space() = 'delete_outline']"))) {
            Assert.assertFalse(elt.isDisplayed());
        }
    }

}
