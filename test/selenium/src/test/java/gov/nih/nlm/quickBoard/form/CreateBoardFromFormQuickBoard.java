package gov.nih.nlm.quickBoard.form;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class CreateBoardFromFormQuickBoard extends NlmCdeBaseTest {

    @Test
    public void createBoardFromFormQuickBoardTest() {
        String boardName = "formQuickBoard";
        String formName1 = "King-Devick Concussion Screening Test (K-D Test)";
        String formName2 = "Hamilton Anxiety Rating Scale (HAM-A)";
        mustBeLoggedOut();
        addFormToQuickBoard(formName1);
        addFormToQuickBoard(formName2);
        goToQuickBoardByModule("form");
        checkElementDoesNotExistByLocator(By.id("addBoard"));

        mustBeLoggedInAs(nlm_username, nlm_password);
        goToQuickBoardByModule("form");
        createBoardFromQuickBoard(boardName, "created from Form quick board.");
        goToBoard(boardName);
        textPresent(formName1);
        textPresent(formName2);
    }

}
