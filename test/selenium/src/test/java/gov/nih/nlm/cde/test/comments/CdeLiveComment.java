package gov.nih.nlm.cde.test.comments;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class CdeLiveComment extends NlmCdeBaseTest {

    @Test
    public void cdeLiveCommentTest() {
        clickElement(By.linkText("NIH CDE Resource Portal"));
        switchTab(0);

        mustBeLoggedInAs(nindsCurator_username, password);
        clickElement(By.id("username_link"));
        clickElement(By.linkText("Profile"));
        clickElement(By.xpath("//tbody/tr//mat-slide-toggle"));
        checkAlert("Saved");
        logout();

        String cdeName = "Sensory system abnormality stocking glove present text";
        String existingComment = "new comment from nlm";
        String newComment = "This comment just added.";
        String reply = "can you see this";
        String replyToReply = "yes, i can";
        mustBeLoggedInAs(ninds_username, password);
        goToCdeByName(cdeName);
        goToDiscussArea();

        switchTab(1);
        goToCdeByName(cdeName);
        goToDiscussArea();
        textPresent(existingComment);
        addComment(newComment);

        switchTab(0);
        textPresent(newComment);
        replyComment(0, reply);

        switchTab(1);
        textPresent(reply);
        replyComment(0, replyToReply);

        switchTab(0);
        textPresent(replyToReply);
        logout();

        mustBeLoggedInAs(nindsCurator_username, password);
        clickElement(By.id("notifications"));
        textPresent("3 new comments");
        textPresent("gPY57SQ7-ZF");
    }
}
