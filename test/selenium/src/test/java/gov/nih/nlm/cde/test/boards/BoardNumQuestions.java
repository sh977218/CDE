package gov.nih.nlm.cde.test.boards;

import org.testng.annotations.Test;

public class BoardNumQuestions extends BoardTest {

    @Test
    public void boardNumQuestions() {
        mustBeLoggedInAs("testuser", password);
        goToBoard("Num Of Questions Board");
        textPresent("22 Questions");
    }

}
