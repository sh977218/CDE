package gov.nih.nlm.cde.test.boards;

import org.testng.annotations.Test;

public class ReviewerCanViewReviewBoardTest extends BoardTest {
    @Test
    public void canViewPrivateSharedBoardBeforeStartReview() {
        String boardName = "Schizophrenia";
        mustBeLoggedInAs(reguser_username, password);
        goToBoard(boardName);
        textPresent(boardName);
        textNotPresent("Start Review");
        textNotPresent("End Review");
        textNotPresent("Share");
    }

    @Test
    public void canViewAfterEndReview() {
        String boardName = "Plantar Fibromatosis";
        mustBeLoggedInAs(reguser_username, password);
        goToBoard(boardName);
        textPresent(boardName);
        textNotPresent("Approve");
        textNotPresent("Disapprove");
    }

    @Test
    public void canReviewAfterStartReview() {
        String boardName = "Chronic Lower-Back Pain";
        mustBeLoggedInAs(reguser_username, password);
        goToBoard(boardName);
        textPresent(boardName);
        textPresent("Approve");
        textPresent("Disapprove");
    }


}
