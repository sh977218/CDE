package gov.nih.nlm.cde.test.boards;

import org.testng.annotations.Test;

public class ReviewerCanNotReviewBoardTest extends BoardTest {
    @Test
    public void cannotReviewBeforeStartReview() {
        String boardName = "Schizophrenia";
        mustBeLoggedInAs(reguser_username, password);
        goToBoard(boardName);
        textPresent(boardName);
        textNotPresent("Approve");
        textNotPresent("Disapprove");
    }

    @Test
    public void cannotReviewIfStartReviewDateIsNull() {
        String boardName = "Hypertension";
        mustBeLoggedInAs(reguser_username, password);
        goToBoard(boardName);
        textPresent(boardName);
        textNotPresent("Approve");
        textNotPresent("Disapprove");
    }

    @Test
    public void cannotReviewAfterEndReview() {
        String boardName = "Gliobastroma Multiform";
        mustBeLoggedInAs(reguser_username, password);
        goToBoard(boardName);
        textPresent(boardName);
        textNotPresent("Approve");
        textNotPresent("Disapprove");
    }
}
