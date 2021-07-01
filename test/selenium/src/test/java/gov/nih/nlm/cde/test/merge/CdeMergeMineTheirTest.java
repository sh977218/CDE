package gov.nih.nlm.cde.test.merge;

import gov.nih.nlm.board.cde.BoardTest;
import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class CdeMergeMineTheirTest extends BoardTest {
    @Test
    public void CdeMergeMineTheir() {
        String cdeName1 = "Smoking Cessation Other Method Specify Text";
        String cdeName2 = "Smoking History Ind";
        mustBeLoggedInAs(cabigEditor_username, password);
        String boardName = "MergeMineTheir";
        createBoard(boardName, "Test No Merge", "cde");

        goToCdeByName(cdeName1);
        clickElement(By.id("addToBoard"));
        textPresent("Added to " + boardName);

        goToCdeByName(cdeName2);
        clickElement(By.id("addToBoard"));
        textPresent("Added to " + boardName);

        goToBoard(boardName);
        textNotPresent("Merge Data Element");
    }
}
