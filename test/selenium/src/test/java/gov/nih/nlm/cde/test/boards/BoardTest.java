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
        int length = driver.findElements(By.linkText("View Board")).size();
        for (int i = 0; i < length; i++) {
            String name = findElement(By.id("dd_name_" + i)).getText();
            if (boardName.equals(name)) {
                findElement(By.id("privateIcon_" + i)).click();
                findElement(By.id("confirmChangeStatus_" + i)).click();
                textPresent(response);
                closeAlert();
//                hangon(2);
                return;
            }
        }
        Assert.assertTrue(false);
    }

    public void gotoMyBoards() {
        findElement(By.id("boardsMenu")).click();
        textPresent("My Boards");
        findElement(By.id("myBoardsLink")).click();
        textPresent("Add Board");
    }

    protected void gotoPublicBoards() {
        findElement(By.linkText("Boards")).click();
        findElement(By.linkText("Public Boards")).click();
    }

    public void createBoard(String name, String description) {
        createBoard(name, description, "Board created.");
    }

    public void createBoard(String name, String description, String response) {
        gotoMyBoards();
        textPresent("Add Board");
        findElement(By.id("addBoard")).click();
        textPresent("Create New Board");
        findElement(By.id("new-board-name")).sendKeys(name);
        findElement(By.id("new-board-description")).sendKeys(description);
        hangon(1);
        findElement(By.id("createBoard")).click();
        textPresent(response);
        closeAlert();
        hangon(1);
    }

    public void removeBoard(String boardName) {
        gotoMyBoards();
        int length = driver.findElements(By.linkText("View Board")).size();
        for (int i = 0; i < length; i++) {
            String name = findElement(By.id("dd_name_" + i)).getText();
            if (boardName.equals(name)) {
                clickElement(By.id("removeBoard-" + i));
                findElement(By.id("confirmRemove-" + i)).click();
                textNotPresent(boardName);
                return;
            }
        }
    }

    protected void pinTo(String cdeName, String boardName) {
        openCdeInList(cdeName);
        findElement(By.id("pinToBoard_0")).click();
        findElement(By.linkText(boardName)).click();
        textPresent("Added to Board");
        closeAlert();
        modalGone();
    }

    protected void goToBoard(String boardName) {
        gotoMyBoards();
        textPresent(boardName);
        findElement(By.id("viewBoard_" + boardName)).click();
        // wait for board to show name in title
        findElement(By.xpath("//h3[text() = '" + boardName + "']"));
    }

}
