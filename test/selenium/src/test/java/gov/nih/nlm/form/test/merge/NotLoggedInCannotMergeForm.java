package gov.nih.nlm.form.test.merge;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class NotLoggedInCannotMergeForm extends NlmCdeBaseTest {

    @Test
    public void notLoggedInCannotMergeForm() {
        mustBeLoggedOut();
        String form1 = "PROMIS SF v1.0 - Pain Behavior 7a";
        String form2 = "Two Dimensional Speckle Tracking Echocardiography Imaging";
        addFormToQuickBoardByTinyId(form1);
        addFormToQuickBoardByTinyId(form2);
        goToQuickBoardByModule("form");
        clickElement(By.id("qb_form_compare"));
        textNotPresent("Merge Form");
    }
}
