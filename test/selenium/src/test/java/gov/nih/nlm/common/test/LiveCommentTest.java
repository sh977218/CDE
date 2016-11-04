package gov.nih.nlm.common.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

@Test(singleThreaded = false, threadPoolSize = 5)
public class LiveCommentTest extends NlmCdeBaseTest {

    @Test
    public void cdeLiveCommentTest_postComment() {
        String cdeName = "Sensory system abnormality stocking glove present text";
        mustBeLoggedInAs(ninds_username, password);
        goToCdeByName(cdeName);
        clickElement(By.id("discussBtn"));

        findElement(By.id("commentTextArea")).sendKeys("newComment from nlm");
        clickElement(By.id("postComment"));
        findElement(By.id("replyTextarea_0")).sendKeys("can u see this, ninds");
        clickElement(By.id("replyBtn_0"));
        textPresent("yes i can");
        clickElement(By.id("removeComment-0"));

    }

    @Test
    public void cdeLiveComment_retrieveComment() {
        String cdeName = "Sensory system abnormality stocking glove present text";
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToCdeByName(cdeName);
        clickElement(By.id("discussBtn"));
        textPresent("newComment from nlm");
        textPresent("can u see this, ninds");
        findElement(By.id("replyTextarea_0")).sendKeys("yes i can");
        clickElement(By.id("replyBtn_0"));
        textNotPresent("newReply");

    }
}
