package gov.nih.nlm.cde.test.boards;

import org.testng.annotations.Test;

public class AddReviewerToBoardTest extends BoardTest {

    @Test
    public void addReviewerToBoard() {
        String boardName = "Bipolar Disorder";
        mustBeLoggedInAs(boardUser, password);
        goToBoard(boardName);
    }

    @Test
    public void reviewerCanViewPrivateSharedBoard() {
        String boardName = "Schizophrenia";
        mustBeLoggedInAs(reguser_username, password);
        goToBoard(boardName);
        textPresent(boardName);
        textNotPresent("Start Review");
        textNotPresent("End Review");
        textNotPresent("Share");
    }
    @Test
    public void viewerCanViewPrivateSharedBoard() {
        String boardName = "Schizophrenia";
        mustBeLoggedInAs(test_username, password);
        goToBoard(boardName);
        textPresent(boardName);
        textNotPresent("Start Review");
        textNotPresent("End Review");
        textNotPresent("Share");
    }


}
