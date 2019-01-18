package gov.nih.nlm.quickBoard.cde;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.testng.annotations.Test;

public class CreateBoardFromCdeQuickBoard extends NlmCdeBaseTest {

    @Test
    public void createBoardFromCdeQuickBoardTest() {
        String boardName = "cdeQuickBoard";
        String cdeName1 = "Disability Rating Scale (DRS) - Grooming disability scale";
        String cdeName2 = "Disability Rating Scale (DRS) - Function level scale";
        mustBeLoggedInAs(nlm_username, nlm_password);
        addCdeToQuickBoard(cdeName1);
        addCdeToQuickBoard(cdeName2);
        goToQuickBoardByModule("cde");
        createBoardFromQuickBoard(boardName, "created from CDE quick board.");
        goToBoard(boardName);
        textPresent(cdeName1);
        textPresent(cdeName2);
    }


}
