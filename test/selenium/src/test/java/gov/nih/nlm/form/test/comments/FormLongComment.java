package gov.nih.nlm.form.test.comments;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.TimeoutException;
import org.testng.annotations.Test;

public class FormLongComment extends NlmCdeBaseTest {

    @Test
    public void formLongCommentTest() {
        String formName = "PROMIS Bank v1.2 - Physical Function";
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToFormByName(formName);
        clickElement(By.id("discussBtn"));
        clickElement(By.id("showAllRepliesButton_0"));
        textNotPresent("Show all 10 replies");
        try {
            for (int k = 1; k <= 10; k++) {
                textPresent("Reply to very long comment " + k);
            }
        } catch (TimeoutException e) {
            clickElement(By.id("showAllRepliesButton_0"));
            for (int k = 1; k <= 10; k++) {
                textPresent("Reply to very long comment " + k);
            }
        }
    }
}
