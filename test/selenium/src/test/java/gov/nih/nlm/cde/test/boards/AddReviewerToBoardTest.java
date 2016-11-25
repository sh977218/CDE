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
        String icon = role == "viewer" ? "fa-eye" : "fa-search-plus";
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
        textPresent("End Review");
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToBoard(boardName);
        clickElement(By.id("approveBoardBtn"));
        closeAlert();
        mustBeLoggedInAs(ninds_username, password);
        goToBoard(boardName);
        clickElement(By.id("disApproveBoardBtn"));
        closeAlert();
    }

    @Test
    public void reviewerCanViewPrivateSharedBoard() {
        String boardName = "Schizophrenia";
        mustBeLoggedInAs(reguser_username, password);
        goToBoard(boardName);
        textPresent(boardName);
        textNotPresent("Start Review");
        textNotPresent("End Review");
        textNotPresent("Share");
    }

    @Test
    public void viewerCanViewPrivateSharedBoard() {
        String boardName = "Schizophrenia";
        mustBeLoggedInAs(test_username, password);
        goToBoard(boardName);
        textPresent(boardName);
        textNotPresent("Start Review");
        textNotPresent("End Review");
        textNotPresent("Share");
    }

    @Test
    public void reviewerCannotReviewBeforeStartReview() {
        String boardName = "Schizophrenia";
        mustBeLoggedInAs(reguser_username, password);
        goToBoard(boardName);
        textPresent(boardName);
        textNotPresent("Approve");
        textNotPresent("Disapprove");
    }

}
