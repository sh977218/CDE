package gov.nih.nlm.cde.test.boards;

import gov.nih.nlm.system.EltIdMaps;
import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;

public class BoardTest extends NlmCdeBaseTest {

    protected void makePublic(String boardName) {
        makePublic(boardName, "Saved");
    }

    protected void makePublic(String boardName, String response) {
        gotoMyBoards();
        editBoardByName(boardName, null, null, true, null);
        checkAlert(response);
        closeAlert();
    }

    public void gotoMyBoards() {
        clickElement(By.id("boardsMenu"));
        textPresent("MY BOARDS");
        clickElement(By.id("myBoardsLink"));
        textPresent("Add Board");
        hangon(2);
    }

    protected void gotoPublicBoards() {
        clickElement(By.linkText("BOARDS"));
        clickElement(By.linkText("PUBLIC BOARDS"));
    }

    public void createBoard(String name, String description, String type) {
        createBoard(name, description, type, "Board created.");
    }

    public void createBoard(String name, String description, String type, String response) {
        gotoMyBoards();
        textPresent("Add Board");
        clickElement(By.id("addBoard"));
        textPresent("Create New Board");
        if (type.equals("cde")) type = "CDEs";
        if (type.equals("form")) type = "Forms";
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

    protected void clickBoardHeaderByName(String boardName) {
        clickElement(By.xpath("//*[@id='" + boardName + "']//*[contains(@class,'card-header')]"));
    }

    private void pinTo(String eltName, String boardName, String type) {
        if (type.equals("cde")) openCdeInList(eltName);
        if (type.equals("form")) openFormInList(eltName);
        clickElement(By.id("pinToBoard_0"));
        textPresent(boardName);
        clickBoardHeaderByName(boardName);
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
            clickElement(By.xpath("//*[@id='" + boardName + "']//a"));
            switchTab(1);
            textPresent(boardName, By.xpath("//h3[@id='board_name_" + boardName + "']"));
        }
    }

    public int getNumberElementsByBoardName(String boardName) {
        WebElement numElt = findElement(By.xpath("//*[@id='" + boardName + "']//*[contains(@class,'numElement')]"));
        int num = Integer.parseInt(numElt.getText().trim());
        return num;
    }


    void editBoardByName(String boardName, String boardNameChange, String boardDescriptionChange, boolean isPublic, String[] boardTags) {
        clickElement(By.xpath("//*[@id='" + boardName + "']//i[contains(@class,'editBoard')]"));
        if (boardNameChange != null) findElement(By.id("boardName")).sendKeys(boardNameChange);
        if (boardDescriptionChange != null) findElement(By.id("boardDescription")).sendKeys(boardDescriptionChange);
        if (isPublic) clickElement(By.id("makePublicBtn"));
        else if (isPublic == false) clickElement(By.id("makePrivateBtn"));
        if (boardTags != null) {
            for (String tag : boardTags) {
                clickElement(By.xpath("//*[@id='boardTag']//input"));
                findElement(By.xpath("//*[@id='boardTag']//input")).sendKeys(tag);
                selectNgSelectDropdownByText(tag);
            }
        }
        clickElement(By.id("saveEditBoardBtn"));
    }
}
