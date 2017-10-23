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

        mustBeLoggedOut();
        goToFormByName(formName);
        goToNaming();
        for (WebElement elt : driver.findElements(By.cssSelector(".fa-trash-o"))) {
            Assert.assertFalse(elt.isDisplayed());
        }
    }

}
