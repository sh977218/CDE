package gov.nih.nlm.cde.test.boards;

import gov.nih.nlm.system.RecordVideo;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class BoardManagement2Test extends BoardTest {

    @Test
    @RecordVideo
    public void cdeBoards() {
        mustBeLoggedInAs(boarduser1_username, password);
        String board1 = "First CDE Board";
        String board2 = "Second CDE Board";
        String cdeName = "Biomarker Outcome Characteristics java.lang.String";

        createBoard(board1, "");
        createBoard(board2, "");

        makePublic(board1);

        pinTo(cdeName, board1);
        pinTo(cdeName, board2);

        goToCdeByName(cdeName);
        showAllTabs();
        clickElement(By.id("boards_tab"));

        textPresent(board1);
        textNotPresent(board2);

        makePublic(board2);

        goToCdeByName(cdeName);
        showAllTabs();
        clickElement(By.id("boards_tab"));

        textPresent(board1);
        textPresent(board2);

        removeBoard(board1);
        removeBoard(board2);
    }

    @Test(priority = 4)
    public void pagination() {
        mustBeLoggedInAs(ninds_username, password);
        goToBoard("Large Board");
        clickElement(By.linkText("10"));
    }

}
