package gov.nih.nlm.common.test;

import gov.nih.nlm.cde.test.comments.CdeCommentTest;
import junit.framework.Assert;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class LiveCommentTest extends CdeCommentTest {

    private void replyComment(String reply, int i) {
        findElement(By.id("replyTextarea_" + i)).sendKeys(reply);
        scrollToViewById("replyBtn_" + i);
        clickElement(By.id("replyBtn_" + i));
        textPresent("Reply added");
        closeAlert();
    }

    @Test
    public void cdeLiveCommentTest() {
        clickElement(By.id("vsacLink"));
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
        replyComment(reply, 0);

        switchTab(1);
        textPresent(reply);
        String replyToReply = "yes, i can";
        replyComment(replyToReply, 0);

        switchTab(0);
        textPresent(replyToReply);
        clickElement(By.id("resolveComment-0"));

        switchTab(1);
        textPresent(newComment, By.cssSelector(".strike"));
        clickElement(By.id("resolveReply-0-0"));


        switchTab(0);
        clickElement(By.id("removeComment-0"));

        switchTab(1);
        textNotPresent(newComment);
        textNotPresent(reply);
        textNotPresent(replyToReply);
    }
}