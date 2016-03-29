package gov.nih.nlm.system;

import org.openqa.selenium.By;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.Assert;
import org.testng.annotations.Test;

public class OldUser extends NlmCdeBaseTest {

    @Test
    public void loggedAfterVeryLongTime() {
        goToCdeSearch();
        findElement(By.id("browseOrg-NINDS")).click();
        textPresent("Used By");
    }

}
