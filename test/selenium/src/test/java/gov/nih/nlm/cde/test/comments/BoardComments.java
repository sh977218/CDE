package gov.nih.nlm.cde.test.comments;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.Assert;
import org.testng.annotations.Test;

public class BoardComments extends NlmCdeBaseTest {

    @Test
    public void boardComments() {
        mustBeLoggedInAs(reguser_username, password);
        String boardName = "Stomach Cancer";
        goToBoard(boardName);
        findElement(By.id("discussBtn"));
        Assert.assertEquals(driver.findElements(By.cssSelector(".faa-wrench")).size(), 0);
        clickElement(By.id("discussBtn"));

        String commentText = "Here is the first comment";
        findElement(By.id("commentTextArea")).sendKeys(commentText);
        clickElement(By.id("postComment"));

        mustBeLoggedInAs(test_username, password);
        goToBoard(boardName);
        clickElement(By.id("discussBtn"));
        textPresent("This comment is pending approval");

        String replyText = "Reply to first comment";
        hangon(1);
        findElement(By.id("replyTextarea_0")).sendKeys(replyText);
        clickElement(By.id("replyBtn_0"));

        mustBeLoggedInAs(commentEditor_username, password);
        clickElement(By.id("incomingMessage"));
        clickElement(By.partialLinkText(commentText));
        clickElement(By.cssSelector("button.approveComment"));
        checkAlert("Message moved to archived.");
        closeAlert();

        mustBeLoggedInAs(reguser_username, password);
        goToBoard(boardName);
        findElement(By.cssSelector(".faa-wrench"));
        clickElement(By.id("discussBtn"));
        textPresent(commentText);
        findElement(By.id("removeComment-0"));
        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.id("removeReply-0-0")));

        mustBeLoggedInAs(boardUser_username, password);
        goToBoard(boardName);
        clickElement(By.id("discussBtn"));
        textPresent(commentText);

        clickElement(By.id("removeReply-0-0"));
        clickElement(By.id("removeComment-0"));

        textNotPresent(commentText);
        textNotPresent(replyText);

    }

}
