package gov.nih.nlm.cde.test.comments;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class CdeApproveComment extends NlmCdeBaseTest {
    @Test
    public void cdeApproveCommentTest() {
        int randomNumber = getRandomNumber();
        String cdeName = "Imaging phase encode direction text";
        String commentText = "Very Innocent Comment " + randomNumber;
        String censoredText = "This comment is pending approval";

        mustBeLoggedInAs(anonymousCommentUser2_username, password);
        goToCdeByName(cdeName);
        addCommentNeedApproval(commentText);

        logout();
        goToCdeByName(cdeName);
        clickElement(By.id("discussBtn"));
        textNotPresent(commentText);
        textPresent(censoredText);

        mustBeLoggedInAs(commentEditor_username, commentEditor_password);
        clickElement(By.id("incomingMessage"));

        textPresent("Comment approval");

        clickElement(By.partialLinkText("Comment approval | " + anonymousCommentUser2_username + " | " + commentText));
        clickElement(By.xpath("//div[contains(@class, 'card')]//a[contains(., '" + cdeName + "')]"));

        switchTab(1);
        textPresent(cdeName);
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
        goToCdeByName(cdeName);
        addComment("OK comment.");
        textNotPresent(censoredText);
        textPresent("OK comment.");

        logout();
        doLogin(ninds_username, password);
        goToCdeByName(cdeName);
        addComment("Curator's comment.");
        textNotPresent(censoredText);
        textPresent("Curator's comment.");
    }

    @Test(dependsOnMethods = {"cdeApproveCommentTest"})
    public void cdeDeclineCommentTest() {
        String cdeName = "Alcohol use started age value";
        String commentText = "Bad Comment";
        String censoredText = "This comment is pending approval.";
        mustBeLoggedInAs(anonymousCommentUser2_username, anonymousCommentUser_password);
        goToCdeByName(cdeName);
        addCommentNeedApproval(commentText);
        logout();

        mustBeLoggedInAs(commentEditor_username, commentEditor_password);
        hangon(1);
        clickElement(By.id("incomingMessage"));

        clickElement(By.partialLinkText("Comment approval | " + anonymousCommentUser2_username + " | " + commentText));

        clickElement(By.cssSelector(".card .linkToElt"));
        switchTab(1);
        textPresent(cdeName);
        switchTabAndClose(0);

        clickElement(By.cssSelector(".card .declineComment"));

        logout();
        goToCdeByName(cdeName);
        clickElement(By.id("discussBtn"));
        textNotPresent(censoredText);
        textNotPresent(commentText);
    }

}
