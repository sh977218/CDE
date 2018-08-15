package gov.nih.nlm.form.test.comments;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormOneUnapprovedReplyPerUser extends NlmCdeBaseTest {

    @Test
    public void formOneUnapprovedReplyPerUserTest() {
        String formName = "PROMIS SF v2.0 - Instrumental Support 4a";
        String reply = "This reply will never be seen.";
        mustBeLoggedInAs(oneUnapprovedReply_username, password);
        goToFormByName(formName);
        goToDiscussArea();
        findElement(By.id("newReplyTextArea_0")).sendKeys(reply);
        clickElement(By.id("replyBtn_0"));
        textNotPresent(reply);
        checkAlert("You cannot do this.");
    }
}
