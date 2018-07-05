package gov.nih.nlm.common.test;

import org.openqa.selenium.By;
import org.openqa.selenium.StaleElementReferenceException;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.Assert;

public abstract class CommentTest extends CommonTest {

    protected void addComment(String text) {
        clickElement(By.id("discussBtn"));
        findElement(By.id("newCommentTextArea")).sendKeys(text);
        hangon(2);
        clickElement(By.id("commentBtn"));
        textPresent(text);
    }

    protected void addCommentNeedApproval(String text) {
        clickElement(By.id("discussBtn"));
        findElement(By.name("newCommentTextArea")).sendKeys(text);
        hangon(2);
        clickElement(By.id("commentBtn"));
        textNotPresent(text);
        textPresent("This comment is pending approval");
    }

    public void approveComments(String eltName, String status, String user) {

    }
}
