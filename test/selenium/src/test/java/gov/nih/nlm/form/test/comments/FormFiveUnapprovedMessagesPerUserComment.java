package gov.nih.nlm.form.test.comments;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormFiveUnapprovedMessagesPerUserComment extends NlmCdeBaseTest {

    @Test
    public void formFiveUnapprovedMessagesPerUserCommentTest() {
        String formName = "PROMIS Parent Proxy SF v1.0 - Peer Relations 7a";
        String comment = "This comment will never be seen.";
        mustBeLoggedInAs(unapprovedMessage_username, password);
        goToFormByName(formName);
        goToDiscussArea();
        findElement(By.name("newCommentTextArea")).sendKeys(comment);
        hangon(2);
        clickElement(By.id("commentBtn"));
        textNotPresent(comment);
        checkAlert("You have too many unapproved messages.");
    }

}
