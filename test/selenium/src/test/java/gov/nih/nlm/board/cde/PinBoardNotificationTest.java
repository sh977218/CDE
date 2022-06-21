package gov.nih.nlm.board.cde;

import org.testng.annotations.Test;

public class PinBoardNotificationTest extends BoardTest {

    @Test
    public void pinBoardSnackBarLink() {
        mustBeLoggedInAs(boardUser, password);
        String boardName = "Test Board";
        String cdeName = "Biomarker Outcome Characteristics java.lang.String";

        goToCdeByName(cdeName);
        pinToBoardFromViewPageWithModalAndGoToBoard(boardName);
        textPresent(cdeName);
    }

}
