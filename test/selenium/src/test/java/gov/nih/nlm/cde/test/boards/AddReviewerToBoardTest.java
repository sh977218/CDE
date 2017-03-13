package gov.nih.nlm.cde.test.boards;

import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class AddReviewerToBoardTest extends BoardTest {

    private void addNewUser(String username, String role) {
        findElement(By.id("newUser_username")).sendKeys(username);
        clickElement(By.id("newUser_change"));
        textPresent("can review");
        clickElement(By.id("newUser_role_" + role));
        String icon = role.equals("viewer") ? "fa-eye" : "fa-search-plus";
        Assert.assertEquals(findElement(By.id("newUser_role")).getAttribute("class").contains(icon), true);
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
        clickElement(By.id("startReviewBtn"));
        textPresent("Board review started");
        closeAlert();
        textPresent("End Review");
        mustBeLoggedInAs(nlm_username, nlm_password);
        clickElement(By.id("incomingMessage"));
        clickElement(By.xpath("//span[contains(., '| board approval | boarduser')]"));
        textPresent(boardName);
        clickElement(By.id("board_Bipolar Disorder"));
        switchTab(1);
        textPresent("In progress");
        clickElement(By.id("approveBoardBtn"));
        switchTabAndClose(0);
        clickElement(By.xpath("//button[.='Archive']"));
        closeAlert();
        mustBeLoggedInAs(ninds_username, password);
        clickElement(By.id("incomingMessage"));
        clickElement(By.xpath("//span[contains(., '| board approval | boarduser')]"));
        textPresent(boardName);
        clickElement(By.id("board_Bipolar Disorder"));
        switchTab(1);
        textPresent("In progress");
        clickElement(By.id("disApproveBoardBtn"));
        switchTabAndClose(0);
        clickElement(By.xpath("//button[.='Archive']"));
        closeAlert();
        mustBeLoggedInAs(boardUser, password);
        goToBoard(boardName);
        Assert.assertEquals(findElement(By.id("reviewer_nlm_status")).getAttribute("class").contains("green-icon"), true);
        Assert.assertEquals(findElement(By.id("reviewer_ninds_status")).getAttribute("class").contains("red-icon"), true);
    }
}
