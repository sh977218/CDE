package gov.nih.nlm.form.test.merge;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class NotLoginCannotMergeForm extends NlmCdeBaseTest {

    @Test
    public void notLoginCannotMergeForm() {
        mustBeLoggedOut();
        String form1 = "PROMIS SF v1.0 - Pain Behavior 7a";
        String form2 = "Two Dimensional Speckle Tracking Echocardiography Imaging";

        addFormToQuickBoard(form1);
        addFormToQuickBoard(form2);
        goToQuickBoardByModule("form");
        clickElement(By.id("qb_form_compare"));
        clickElement(By.xpath("//*[@class='leftObj']/*[contains(@class,'mergeForm')]"));
        textPresent("Log in to merge", By.id("mergeFormWarningDiv"));
    }
}
