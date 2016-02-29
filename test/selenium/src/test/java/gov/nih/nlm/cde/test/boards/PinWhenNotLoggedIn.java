package gov.nih.nlm.cde.test.boards;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class PinWhenNotLoggedIn extends NlmCdeBaseTest {

    @Test
    public void pinWhenNotLoggedIn() {
        mustBeLoggedOut();
        goToCdeSearch();
        clickElement(By.id("browseOrg-NINDS"));
        textPresent("results for All Terms");
        clickElement(By.id("pinAll"));
        textPresent("Create Boards and attach CDEs to them");
        clickElement(By.id("signUpLink"));
        textPresent("Log in with your UMLS");
        driver.navigate().back();

        clickElement(By.id("pinToBoard_0"));
        textPresent("Create Boards and attach CDEs to them");
        clickElement(By.id("cancelSelect"));
        modalGone();

        clickElement(By.id("linkToElt_0"));
        clickElement(By.id("addToBoard"));
        textPresent("Create Boards and attach CDEs to them");
        clickElement(By.id("cancelSelect"));
        modalGone();
    }

}
