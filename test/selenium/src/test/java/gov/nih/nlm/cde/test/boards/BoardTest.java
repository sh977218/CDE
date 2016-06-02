package gov.nih.nlm.cde.test.boards;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;

public class BoardTest extends NlmCdeBaseTest {

    protected void makePublic(String boardName) {
        makePublic(boardName, "Saved");
    }

    protected void makePublic(String boardName, String response) {
        gotoMyBoards();
        textPresent(boardName);
        int length = driver.findElements(By.xpath("//*[@class='my-board-card']")).size();
        for (int i = 0; i < length; i++) {
            String name = findElement(By.id("board_name_" + i)).getText();
            if (boardName.equals(name)) {
                clickElement(By.id("privateIcon_" + i));
                textPresent("Change Status?");
                clickElement(By.id("confirmChangeStatus_" + i));
                textPresent(response);
                closeAlert();
                return;
            }
        }
        Assert.fail();
    }

    public void gotoMyBoards() {
        clickElement(By.id("boardsMenu"));
        textPresent("My Boards");
        clickElement(By.id("myBoardsLink"));
        textPresent("Add Board");
        hangon(2);
    }

    protected void gotoPublicBoards() {
        clickElement(By.linkText("Boards"));
        clickElement(By.linkText("Public Boards"));
    }

    public void createBoard(String name, String description) {
        createBoard(name, description, "Board created.");
    }

    public void createBoard(String name, String description, String response) {
        gotoMyBoards();
        textPresent("Add Board");
        clickElement(By.id("addBoard"));
        textPresent("Create New Board");
        findElement(By.id("new-board-name")).sendKeys(name);
        findElement(By.id("new-board-description")).sendKeys(description);
        hangon(2);
        clickElement(By.id("createBoard"));
        textPresent(response);
        closeAlert();
    }

    public void removeBoard(String boardName) {
        gotoMyBoards();
        int length = driver.findElements(By.xpath("//*[@class='my-board-card']")).size();
        for (int i = 0; i < length; i++) {
            String name = findElement(By.id("board_name_" + i)).getText();
            if (boardName.equals(name)) {
                clickElement(By.id("removeBoard-" + i));
                clickElement(By.id("confirmRemove-" + i));
                textNotPresent(boardName);
                return;
            }
        }
    }

    protected void pinTo(String cdeName, String boardName) {
        openCdeInList(cdeName);
        clickElement(By.id("pinToBoard_0"));
        clickElement(By.linkText(boardName));
        textPresent("Added to Board");
        closeAlert();
        modalGone();
    }

    protected void goToBoard(String boardName) {
        gotoMyBoards();
        textPresent(boardName);
        clickElement(By.id("viewBoard_" + boardName));
        switchTab(1);
        textPresent(boardName, By.id("board_name_" + boardName));
    }

}
