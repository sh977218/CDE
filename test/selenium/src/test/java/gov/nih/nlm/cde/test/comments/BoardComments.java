package gov.nih.nlm.cde.test.comments;

import gov.nih.nlm.system.EltIdMaps;
import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.annotations.Test;

public class BoardComments extends NlmCdeBaseTest {

    @Test
    public void boardComments() {
        mustBeLoggedInAs("reguser", password);
        String boardName = "Stomach Cancer";
        String boardId = EltIdMaps.eltMap.get(boardName);
        driver.get(baseUrl + "/board/" + boardId);
        clickElement(By.id("discussBtn"));

        String commentText = "Here is the first comment";
        findElement(By.id("commentTextArea")).sendKeys(commentText);
        clickElement(By.id("postComment"));
        textPresent("Comment added. Approval required.");
        closeAlert();

        mustBeLoggedInAs(test_username, password);
        driver.get(baseUrl + "/board/" + boardId);
        clickElement(By.id("discussBtn"));
        textPresent("This comment is pending approval");

        String replyText = "Reply to first comment";
        findElement(By.id("replyTextarea_0")).sendKeys(replyText);
        clickElement(By.id("replyBtn_0"));
        textPresent("Reply added");
        closeAlert();

        mustBeLoggedInAs(commentEditor_username, password);
        clickElement(By.id("incomingMessage"));
        clickElement(By.xpath("//span[contains(., '" + commentText + "')]"));
        clickElement(By.cssSelector(".panel-open button.approveComment"));
        textPresent("Message moved to archived.");
        closeAlert();
        closeAlert();

        mustBeLoggedInAs("reguser", password);
        driver.get(baseUrl + "/board/" + boardId);
        clickElement(By.id("discussBtn"));
        textPresent(commentText);
        findElement(By.id("removeComment-0"));
        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.id("removeReply-0-0")));

        mustBeLoggedInAs("boarduser", password);
        driver.get(baseUrl + "/board/" + boardId);
        clickElement(By.id("discussBtn"));
        textPresent(commentText);

        clickElement(By.id("removeReply-0-0"));
        textPresent("Comment removed");
        closeAlert();

        clickElement(By.id("removeComment-0"));
        textPresent("Comment removed");
        closeAlert();

        textNotPresent(commentText);
        textNotPresent(replyText);

    }

}
