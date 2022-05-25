package gov.nih.nlm.board.cde;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class PinBoardNotificationTest extends BoardTest {

    @Test
    public void pinBoardSnackBarLink() {
        mustBeLoggedInAs(boardUser, password);
        String boardName = "Test Board";

        String cdeName2 = "Biomarker Outcome Characteristics java.lang.String";
        goToCdeByName(cdeName2);
        clickElement(By.id("addToBoard"));
        clickBoardHeaderByName(boardName);
        textPresent("Pinned to " + boardName);

        clickElement(By.linkText(boardName));

        textPresent("Export Board");

    }

}
