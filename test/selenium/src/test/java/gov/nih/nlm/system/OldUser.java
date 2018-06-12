package gov.nih.nlm.system;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class OldUser extends NlmCdeBaseTest {

    @Test
    public void loggedAfterVeryLongTime() {
        mustBeLoggedInAs(oldUser_username, password);
        goToCdeSearch();
        findElement(By.id("browseOrg-NINDS")).click();
        textPresent("Used By");
    }

}
