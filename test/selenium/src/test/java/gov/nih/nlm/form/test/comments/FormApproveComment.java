package gov.nih.nlm.form.test.comments;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormApproveComment extends NlmCdeBaseTest {

    @Test
    public void formApproveFormCommentTest() {

        int randomNumber = getRandomNumber();
        String formName = "Vital Signs and Tests";
        String commentText = "Very Innocent Comment " + randomNumber;
        String censoredText = "This comment is pending approval";

        mustBeLoggedInAs(anonymousCommentUser2_username, password);
        goToFormByName(formName);
        addCommentNeedApproval(commentText);

        logout();
        goToFormByName(formName);
        clickElement(By.id("discussBtn"));
        textNotPresent(commentText);
        textPresent(censoredText);

        mustBeLoggedInAs(commentEditor_username, commentEditor_password);
        clickElement(By.id("incomingMessage"));

        textPresent("Comment approval");

        clickElement(By.partialLinkText("Comment approval | " + anonymousCommentUser2_username + " | " + commentText));
        clickElement(By.xpath("//div[contains(@class, 'card')]//a[contains(., '" + formName + "')]"));

        switchTab(1);
        textPresent(formName);
        switchTabAndClose(0);

        clickElement(By.cssSelector(".card .authorizeUser"));
        clickElement(By.id("authorizeUserOK"));

        checkAlert("Role added");
        modalGone();

        clickElement(By.cssSelector(".card .approveComment"));
        checkAlert("Message moved to archive");

        logout();
        clickElement(By.id("discussBtn"));
        textNotPresent(censoredText);
        textPresent(commentText);

        doLogin(anonymousCommentUser2_username, anonymousCommentUser_password);
        goToFormByName(formName);
        addComment("OK comment.");
        textNotPresent(censoredText);
        textPresent("OK comment.");

        logout();
        doLogin(ninds_username, password);
        goToFormByName(formName);
        addComment("Curator's comment.");
        textNotPresent(censoredText);
        textPresent("Curator's comment.");
    }

}
