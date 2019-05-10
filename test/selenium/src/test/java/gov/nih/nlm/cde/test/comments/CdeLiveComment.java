package gov.nih.nlm.cde.test.comments;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class CdeLiveComment extends NlmCdeBaseTest {

    @Test
    public void cdeLiveCommentTest() {
        goHome();
        clickElement(By.linkText("NIH CDE Resource Portal"));
        switchTab(0);

        mustBeLoggedInAs(nindsCurator_username, password);
        goToProfile();
        textPresent("Enabled", By.xpath("//tbody/tr//mat-slide-toggle"));
        logout();

        String cdeName = "Sensory system abnormality stocking glove present text";
        String existingComment = "new comment from nlm";
        String newComment = "This comment just added.";
        String reply = "can you see this";
        String replyToReply = "yes, i can";
        mustBeLoggedInAs(ninds_username, password);
        goToCdeByName(cdeName);
        goToDiscussArea();

        replyComment(0, reply);

        switchTab(1);
        goToCdeByName(cdeName);
        goToDiscussArea();
        textPresent(existingComment);
        addComment(newComment);

        switchTab(0);
        textPresent(newComment);

        switchTab(1);
        textPresent(reply);
        replyComment(0, replyToReply);

        switchTab(0);
        textPresent(replyToReply);
        logout();

        mustBeLoggedInAs(nindsCurator_username, password);
        clickElement(By.cssSelector("[data-id = 'notifications']"));
        textPresent("3 comments",
                By.xpath("//div[contains(@class, 'taskItem')][*//mat-chip[contains(text(), 'gPY57SQ7_ZF')]]"));
        textPresent(reply,
                By.xpath("//div[contains(@class, 'taskItem')][*//mat-chip[contains(text(), 'gPY57SQ7_ZF')]]"));
    }
}
