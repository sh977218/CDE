package gov.nih.nlm.board.cde;

import gov.nih.nlm.system.EltIdMaps;
import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.Select;

import java.util.Random;

public class BoardTest extends NlmCdeBaseTest {
    Random rand = new Random(); //instance of random class
    int upperbound = 2;

    public void createBoard(String name, String description, String type) {
        createBoard(name, description, type, "Board created.");
    }

    public void createBoard(String name, String description, String type, String response) {
        gotoMyBoards();
        textPresent("Add Board");
        clickElement(By.id("addBoard"));
        hangon(1);
        textPresent("Create New Board");
        if (type.equals("cde")) type = "CDEs";
        if (type.equals("form")) type = "Forms";
        new Select(driver.findElement(By.id("new-board-type"))).selectByVisibleText(type);
        findElement(By.id("new-board-name")).sendKeys(name);
        findElement(By.id("new-board-description")).sendKeys(description);
        hangon(2);
        clickSaveButton();
        checkAlert(response);
    }

    protected void pinCdeToBoardWithModal(String cdeName, String boardName) {
        pinTo(cdeName, "cde");
        textPresent(boardName);
        clickBoardHeaderByName(boardName);
        checkAlert("Pinned to " + boardName);
        modalGone();
    }

    protected void pinCdeToBoardWithoutModal(String cdeName, String boardName) {
        pinTo(cdeName, "cde");
        checkAlert("Pinned to " + boardName);
    }

    protected void pinFormToBoardWithModal(String formName, String boardName) {
        pinTo(formName, "form");
        textPresent(boardName);
        clickBoardHeaderByName(boardName);
        checkAlert("Pinned to " + boardName);
        modalGone();
    }

    protected void pinFormToBoarWithoutModal(String formName, String boardName) {
        pinTo(formName, "form");
        checkAlert("Pinned to " + boardName);
    }

    protected void clickBoardHeaderByName(String boardName) {
        clickElement(By.xpath("//*[@id='" + boardName + "']//mat-card-title"));
    }

    private void pinTo(String eltName, String type) {
        int int_random = rand.nextInt(upperbound);
        if (type.equals("cde")) openCdeInList(eltName);
        if (type.equals("form")) openFormInList(eltName);
        if (int_random == 1) {
            clickElement(By.id("list_gridView"));
        }
        clickElement(By.id("pinToBoard_0"));
    }

    public int getNumberElementsByBoardName(String boardName) {
        WebElement numElt = findElement(By.xpath("//*[@id='" + boardName + "']//*[contains(@class,'numElement')]"));
        int num = Integer.parseInt(numElt.getText().trim());
        return num;
    }


    void editBoardByName(String boardName, String boardNameChange, String boardDescriptionChange, boolean isPublic, String[] boardTags, String response) {
        clickElement(By.xpath("//*[@id='" + boardName + "']//*[contains(@class,'editBoard')]"));
        hangon(1);
        if (boardNameChange != null) findElement(By.id("boardName")).sendKeys(boardNameChange);
        if (boardDescriptionChange != null) findElement(By.name("boardDescription")).sendKeys(boardDescriptionChange);
        if (isPublic) clickElement(By.id("makePublicBtn"));
        else clickElement(By.id("makePrivateBtn"));
        if (boardTags != null) {
            for (String tag : boardTags) {
                clickElement(By.xpath("//*[@id='boardTag']//input"));
                findElement(By.xpath("//*[@id='boardTag']//input")).sendKeys(tag + ",");
            }
        }
        clickSaveButton();
        checkAlert(response);
    }

    protected void pinAllToBoardFromSearchPage(String boardName) {
        clickElement(By.id("pinAll"));
        textPresent("Choose a Board to pin");
        clickBoardHeaderByName(boardName);
        checkAlert("All elements pinned");
    }

    protected void pinToBoardFromViewPageWithModalAndGoToBoard(String boardName) {
        clickElement(By.id("addToBoard"));
        clickBoardHeaderByName(boardName);
        clickElement(By.linkText(boardName));
    }

    protected void pinToBoardFromViewPageWithModal(String boardName) {
        clickElement(By.id("addToBoard"));
        clickBoardHeaderByName(boardName);
        checkAlert("Pinned to " + boardName);
        modalGone();
    }

    protected void pinToBoardFromViewPageWithoutModal(String boardName) {
        clickElement(By.id("addToBoard"));
        textPresent("Pinned to " + boardName);
        closeAlert();
    }
}
