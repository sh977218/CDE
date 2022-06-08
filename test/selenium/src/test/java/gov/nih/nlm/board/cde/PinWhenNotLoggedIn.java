package gov.nih.nlm.board.cde;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class PinWhenNotLoggedIn extends NlmCdeBaseTest {

    @Test
    public void pinWhenNotLoggedIn() {
        goToCdeSearch();
        clickElement(By.id("browseOrg-NINDS"));
        textPresent("results. Sorted by relevance.");
        clickElement(By.id("pinAll"));
        textPresent("Create Boards and attach CDEs to them");
        clickElement(By.xpath("//a[text()='Sign up or Sign in']"));
        isLoginPage();
        driver.navigate().back();

        clickElement(By.id("pinToBoard_0"));
        textPresent("Create Boards and attach CDEs to them");
        clickElement(By.xpath("//button[text()='Cancel']"));
        modalGone();

        clickElement(By.id("linkToElt_0"));
        clickElement(By.id("addToBoard"));
        textPresent("Create Boards and attach CDEs to them");
        clickElement(By.xpath("//button[text()='Cancel']"));
        modalGone();
    }

}
