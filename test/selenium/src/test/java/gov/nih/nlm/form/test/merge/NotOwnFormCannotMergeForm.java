package gov.nih.nlm.form.test.merge;

import gov.nih.nlm.board.cde.BoardTest;
import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;


public class NotOwnFormCannotMergeForm extends BoardTest {

    @Test
    public void notOwnLeftFormCannotMergeForm() {
        mustBeLoggedInAs(ninds_username, password);
        String form1 = "PROMIS SF v1.0 - Pain Behavior 7a";
        String form2 = "Two Dimensional Speckle Tracking Echocardiography Imaging";

        String boardName = "NoMergeTest";

        createBoard(boardName, "Test no merge", "form");

        goToFormByName(form1);
        clickElement(By.id("addToBoard"));
        textPresent("Pinned to " + boardName);

        goToFormByName(form2);
        clickElement(By.id("addToBoard"));
        textPresent("Pinned to " + boardName);

        goToBoard(boardName);
        clickElement(By.id("qb_compare"));
        textNotPresent("Merge Form");
    }

    @Test
    public void notOwnRightFormCannotMergeForm() {
        mustBeLoggedInAs(promis_username, password);
        String form1 = "Patient Health Questionnaire-2 (PHQ-2)";
        String form2 = "Patient Health Questionnaire 2 item (PHQ-2) [Reported]";

        String boardName = "NoMergeTest";

        createBoard(boardName, "Test no merge", "form");

        goToFormByName(form1);
        clickElement(By.id("addToBoard"));
        textPresent("Pinned to " + boardName);

        goToFormByName(form2);
        clickElement(By.id("addToBoard"));
        textPresent("Pinned to " + boardName);

        goToBoard(boardName);
        clickElement(By.id("qb_compare"));
        textNotPresent("Merge Form");
    }


}
