package gov.nih.nlm.cde.test.boards;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class IHaveNoBoard extends BoardTest {

    @Test
    public void iHaveNoBoard() {
        mustBeLoggedInAs(boarduser2_username, password);
        String cdeName = "Specimen Array";

        goToCdeSearch();
        openCdeInList(cdeName);
        clickElement(By.id("pinToBoard_0"));
        textPresent("You don't have any boards");
        textPresent("Add Board");
        clickElement(By.id("cancelSelect"));
        modalGone();
    }

}
