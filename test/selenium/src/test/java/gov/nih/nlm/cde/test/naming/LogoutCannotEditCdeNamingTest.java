package gov.nih.nlm.cde.test.naming;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.testng.Assert;
import org.testng.annotations.Test;

public class LogoutCannotEditCdeNamingTest extends NlmCdeBaseTest {

    @Test
    public void logoutCannotEditCdeNaming() {
        String cdeName = "cde for test cde reorder detail tabs";

        mustBeLoggedOut();
        goToCdeByName(cdeName);
        clickElement(By.id("naming_tab"));
        for (WebElement elt : driver.findElements(By.cssSelector(".fa-trash-o"))) {
            Assert.assertFalse(elt.isDisplayed());
        }
    }

}
