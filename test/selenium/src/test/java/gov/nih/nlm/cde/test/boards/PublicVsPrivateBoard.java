package gov.nih.nlm.cde.test.boards;

import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.Assert;
import org.testng.annotations.Test;

public class PublicVsPrivateBoard extends BoardTest {

    @Test
    public void publicVsPrivateBoards() {
        mustBeLoggedInAs(boardUser, password);
        String boardName = "Public Board";
        String boardDef = "This board will be public";

        createBoard(boardName, "This board will be public");
        pinTo("Heart MUGA", boardName);
        // by default, board is private.

        goToBoard(boardName);
        // I can view my own board.
        textPresent("MUGA");
        String url = driver.getCurrentUrl();
        String boardId = url.substring(url.lastIndexOf("/") + 1);

        logout();
        driver.get(baseUrl + "/#/board/" + boardId);
        // not logged in, I can't see
        textPresent("Board not found");
        closeAlert();
        textNotPresent(boardDef);

        loginAs(ctepCurator_username, password);
        driver.get(baseUrl + "/#/board/" + boardId);
        // logged in as someone else, I can't see
        textPresent("Board not found");
        closeAlert();
        textNotPresent(boardDef);

        logout();

        loginAs(boardUser, password);
        makePublic(boardName);

        logout();

        driver.get(baseUrl + "/#/board/" + boardId);
        // Now I can see;
        textPresent("MUGA");

        loginAs(boardUser, password);
        gotoMyBoards();
        int length = driver.findElements(By.linkText("View Board")).size();
        for (int i = 0; i < length; i++) {
            String name = findElement(By.id("dd_name_" + i)).getText();
            if (boardName.equals(name)) {
                findElement(By.id("publicIcon_" + i)).click();
                findElement(By.id("confirmChangeStatus_" + i)).click();
                wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("privateIcon_" + i)));
                i = length;
            }
        }

        logout();

        driver.get(baseUrl + "/#/board/" + boardId);
        // private again, I can't see
        textNotPresent("Not a very useful");

        loginAs(boardUser, password);

        removeBoard(boardName);
    }

}