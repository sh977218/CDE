package gov.nih.nlm.cde.test.boards;

import gov.nih.nlm.system.EltIdMaps;
import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
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
                checkAlert(response);
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

    public void createBoard(String name, String description, String type) {
        createBoard(name, description, type, "Board created.");
    }

    public void createBoard(String name, String description, String type, String response) {
        gotoMyBoards();
        textPresent("Add Board");
        clickElement(By.id("addBoard"));
        textPresent("Create New Board");
        if (type.equals("cde"))
            type = "CDEs";
        if (type.equals("form"))
            type = "Forms";
        new Select(driver.findElement(By.id("new-board-type"))).selectByVisibleText(type);
        findElement(By.id("new-board-name")).sendKeys(name);
        findElement(By.id("new-board-description")).sendKeys(description);
        hangon(2);
        clickElement(By.id("createBoard"));
        checkAlert(response);
    }

    protected void pinCdeToBoard(String cdeName, String cdeBoardName) {
        pinTo(cdeName, cdeBoardName, "cde");
    }

    protected void pinFormToBoard(String formName, String formBoardName) {
        pinTo(formName, formBoardName, "form");
    }

    private void pinTo(String eltName, String boardName, String type) {
        if (type.equals("cde")) openCdeInList(eltName);
        if (type.equals("form")) openFormInList(eltName);
        clickElement(By.id("pinToBoard_0"));
        textPresent(boardName);
        clickElement(By.linkText(boardName));
        checkAlert("Added to Board");
        modalGone();
    }

    public void goToBoard(String boardName) {
        String boardId = EltIdMaps.eltMap.get(boardName);
        if (boardId != null) {
            driver.get(baseUrl + "/board/" + boardId);
            textPresent(boardName);
        } else {
            gotoMyBoards();
            textPresent(boardName);
            clickElement(By.xpath("//*[@id='viewBoard_" + boardName + "']//a"));
            switchTab(1);
            textPresent(boardName, By.xpath("//h3[@id='board_name_" + boardName + "']"));
        }
    }

}
