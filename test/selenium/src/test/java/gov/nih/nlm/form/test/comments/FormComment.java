package gov.nih.nlm.form.test.comments;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;


public class FormComment extends NlmCdeBaseTest {

    @Test
    public void formCommentsTest() {

        String formName = "Risk Factor Questionnaire (RFQ) - Physical Activity and Sleep";
        mustBeLoggedInAs(test_username, password);
        goToFormByName(formName);

        addComment("My First Comment about Status!");
        textPresent("My First Comment about Status!");
        Assert.assertEquals(true, findElement(By.id("currentComment_0")).getAttribute("class").contains("currentTabComment"));

        goToNaming();
        findElement(By.name("commentTextArea")).sendKeys("another comment about Naming");
        clickElement(By.name("postComment"));

        findElement(By.xpath("//*[@id='comment_0' and not(contains(@class, 'currentTabComment'))]"));
        findElement(By.xpath("//*[@id='comment_1' and contains(@class, 'currentTabComment')]"));

        clickElement(By.id("newReplyTextArea_0"));
        findElement(By.id("newReplyTextArea_0")).sendKeys("Reply to First comment about Status");
        scrollToViewById("replyBtn_0");
        clickElement(By.id("replyBtn_0"));

        clickElement(By.id("newReplyTextArea_0"));
        findElement(By.id("newReplyTextArea_0")).sendKeys("Second reply to First comment about Status");
        hangon(1);

        scrollToViewById("replyBtn_0");
        clickElement(By.id("replyBtn_0"));

        clickElement(By.id("newReplyTextArea_1"));
        findElement(By.id("newReplyTextArea_1")).sendKeys("Reply to another comment about Naming");
        hangon(1);
        scrollToViewById("replyBtn_1");
        clickElement(By.id("replyBtn_1"));
        textPresent("Reply to another comment about Naming", By.id("replyText-1-0"));

        scrollToTop();
        clickElement(By.id("resolveReply-0-0"));
        textPresent("Reply to First comment", By.cssSelector(".strike"));

        clickElement(By.id("reopenReply-0-0"));

        scrollDownBy(500);
        clickElement(By.id("resolveReply-1-0"));
        textPresent("Reply to another comment", By.cssSelector(".strike"));

        clickElement(By.id("removeReply-0-1"));

        textPresent("My First Comment about Status!");
        textPresent("Reply to First comment about Status");
        textNotPresent("Second reply to First comment about Status");
        textPresent("another comment about Naming");
        textPresent("Reply to another comment about Naming");
    }

}
