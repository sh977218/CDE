package gov.nih.nlm.cde.test.boards;

import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.Test;

public class AddReviewerToBoardTest extends BoardTest {

    private void addNewUser(String username, String role) {
        findElement(By.id("newUser_username")).sendKeys(username);
        new Select(findElement(By.id("newUser_role"))).selectByValue(role);
        clickElement(By.id("addUserBtn"));
    }

    @Test
    public void addReviewerToBoard() {
        String boardName = "Bipolar Disorder";
        mustBeLoggedInAs(boardUser, password);
        goToBoard(boardName);
        clickElement(By.id("shareBoardBtn"));
        textPresent("Share this board");
        addNewUser("nlm", "reviewer");
        addNewUser("reguser", "viewer");
        addNewUser("ninds", "reviewer");
        clickElement(By.id("sendBtn"));
        hangon(1);
        clickElement(By.id("startReviewBtn"));
        textPresent("End Review");
        mustBeLoggedInAs(nlm_username, nlm_password);
        clickElement(By.id("incomingMessage"));
        clickElement(By.partialLinkText("| Board approval | boarduser"));
        textPresent(boardName);
        clickElement(By.xpath("//*[@id='board_Bipolar Disorder']"));
        switchTab(1);
        textPresent("In progress");
        clickElement(By.id("approveBoardBtn"));
        switchTabAndClose(0);
        clickElement(By.xpath("//button[normalize-space(.)='Archive']"));
        closeAlert();
        mustBeLoggedInAs(ninds_username, password);
        clickElement(By.id("incomingMessage"));
        clickElement(By.partialLinkText("Board approval | boarduser"));
        textPresent(boardName);
        clickElement(By.xpath("//*[@id='board_Bipolar Disorder']"));
        switchTab(1);
        textPresent("In progress");
        clickElement(By.id("disApproveBoardBtn"));
        switchTabAndClose(0);
        clickElement(By.xpath("//button[normalize-space(.)='Archive']"));
        closeAlert();
        mustBeLoggedInAs(boardUser, password);
        goToBoard(boardName);
        Assert.assertEquals(findElement(By.id("reviewer_nlm_status")).getAttribute("class").contains("green-icon"), true);
        Assert.assertEquals(findElement(By.id("reviewer_ninds_status")).getAttribute("class").contains("red-icon"), true);
    }
}
