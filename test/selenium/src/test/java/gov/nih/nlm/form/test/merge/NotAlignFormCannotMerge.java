package gov.nih.nlm.form.test.merge;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class NotAlignFormCannotMerge extends NlmCdeBaseTest {

    @Test
    public void notAlignFormCannotMerge() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        String form1 = "PROMIS SF v1.0-Sleep Disturbance 4a";
        String form2 = "PROMIS SF v1.0-Sleep Disturbance 6a";
        addFormToQuickBoardByTinyId(form1);
        addFormToQuickBoardByTinyId(form2);
        goToQuickBoardByModule("form");
        clickElement(By.id("qb_compare"));
        clickElement(By.xpath("//*[@class='leftObj']/*[contains(@class,'mergeForm')]"));

        clickElement(By.id("retireCde"));
        scrollToViewById("mergeFormErrorDiv");
        textPresent("Form not align");
    }
}
