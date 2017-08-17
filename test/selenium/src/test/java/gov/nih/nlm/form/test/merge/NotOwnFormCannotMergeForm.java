package gov.nih.nlm.form.test.merge;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;


public class NotOwnFormCannotMergeForm extends NlmCdeBaseTest {

    @Test
    public void notOwnLeftFormCannotMergeForm() {
        mustBeLoggedInAs(ninds_username, password);
        String form1 = "PROMIS SF v1.0 - Pain Behavior 7a";
        String form2 = "Two Dimensional Speckle Tracking Echocardiography Imaging";

        addFormToQuickBoardByTinyId(form1);
        addFormToQuickBoardByTinyId(form2);
        goToQuickBoardByModule("form");
        clickElement(By.id("qb_compare"));
        textNotPresent("Merge Form");
    }

    @Test
    public void notOwnRightFormCannotMergeForm() {
        mustBeLoggedInAs(promis_username, password);
        String form1 = "Patient Health Questionnaire-2 (PHQ-2)";
        String form2 = "Patient Health Questionnaire 2 item (PHQ-2) [Reported]";

        addFormToQuickBoardByTinyId(form1);
        addFormToQuickBoardByTinyId(form2);
        goToQuickBoardByModule("form");
        clickElement(By.id("qb_compare"));
        textNotPresent("Merge Form");
    }


}
