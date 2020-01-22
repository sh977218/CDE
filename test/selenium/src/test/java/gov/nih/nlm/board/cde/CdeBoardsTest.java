package gov.nih.nlm.board.cde;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class CdeBoardsTest extends BoardTest {

    @Test
    public void cdeBoards() {
        mustBeLoggedInAs(boarduser1_username, password);
        String board1 = "First CDE Board";
        String board2 = "Second CDE Board";
        String cdeName = "Biomarker Outcome Characteristics java.lang.String";

        pinCdeToBoard(cdeName, board1);
        pinCdeToBoard(cdeName, board2);

        goToCdeByName(cdeName);

        clickElement(By.id("openLinkedBoardsModalBtn"));
        textPresent(board1);
        textNotPresent(board2);
        clickElement(By.id("closeLinkedBoardBtn"));

        makePublic(board2);

        goToCdeByName(cdeName);

        clickElement(By.id("openLinkedBoardsModalBtn"));

        textPresent(board1);
        textPresent(board2);
    }

    @Test
    public void pagination() {
        mustBeLoggedInAs(ninds_username, password);
        goToBoard("Large Board");
        for(int i = 0; i< 9; i++) {
            clickElement(By.cssSelector(".mat-paginator-navigation-next"));
            hangon(1);
        }
        textPresent("The indicator whether participant/subject worked in landscaping/gardening/groundskeeping from age 36 to 45 as part of the Risk Factor Questionnaire (RFQ-U) for Pesticide (Work).");
    }

}
