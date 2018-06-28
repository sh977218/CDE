package gov.nih.nlm.cde.test.comments;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class CdeLiveComment extends NlmCdeBaseTest {

    @Test
    public void cdeLiveCommentTest() {
        clickElement(By.linkText("NIH CDE Resource Portal"));
        String cdeName = "Sensory system abnormality stocking glove present text";
        switchTab(0);
        mustBeLoggedInAs(ninds_username, password);
        goToCdeByName(cdeName);
        clickElement(By.id("discussBtn"));
        hangon(2);

        switchTab(1);
        goToCdeByName(cdeName);
        String newComment = "new comment from nlm";
        addComment(newComment);

        switchTab(0);
        textPresent(newComment);
        String reply = "can you see this";
        scrollToTop();
        replyComment(0, reply);

        switchTab(1);
        textPresent(reply);
        String replyToReply = "yes, i can";
        replyComment(0, replyToReply);

        switchTab(0);
        textPresent(replyToReply);
        clickElement(By.id("resolveComment-0"));

        switchTab(1);
        textPresent(newComment, By.cssSelector(".strike"));
        clickElement(By.id("resolveReply-0-0"));


        switchTab(0);
        clickElement(By.id("removeComment_0"));

        switchTab(1);
        textNotPresent(newComment);
        textNotPresent(reply);
        textNotPresent(replyToReply);
    }
}
