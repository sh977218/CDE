package gov.nih.nlm.form.test.merge;

import gov.nih.nlm.board.cde.BoardTest;
import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class NotAlignFormCannotMerge extends BoardTest {

    @Test
    public void notAlignFormCannotMerge() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        String form1 = "PROMIS SF v1.0-Sleep Disturbance 4a";
        String form2 = "PROMIS SF v1.0-Sleep Disturbance 6a";

        String boardName = "NotAlignForm";

        goToFormByName(form1);
        clickElement(By.id("addToBoard"));
        clickBoardHeaderByName(boardName);
        checkAlert("Pinned to " + boardName);

        goToFormByName(form2);
        clickElement(By.id("addToBoard"));
        clickBoardHeaderByName(boardName);
        checkAlert("Pinned to " + boardName);

        goToBoard(boardName);

        clickElement(By.id("qb_compare"));
        clickElement(By.xpath("//*[contains(@class,'leftObj')]//*[@id='openMergeFormModalBtn']"));

        clickElement(By.id("retireCde"));
        scrollToViewById("mergeFormErrorDiv");
        textPresent("Form not align");
    }
}
