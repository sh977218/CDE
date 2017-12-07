package gov.nih.nlm.cde.test.boards;

import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.annotations.Test;

public class PublicVsPrivateBoard extends BoardTest {

    @Test
    public void publicVsPrivateBoards() {
        mustBeLoggedInAs(boardUser, password);
        String boardName = "Public Board";
        String boardDef = "This boards will be public";

        pinCdeToBoard("Heart MUGA Test Date", boardName);
        // by default, boards is private.

        goToBoard(boardName);
        // I can view my own boards.
        textPresent("MUGA");
        String url = driver.getCurrentUrl();
        String boardId = url.substring(url.lastIndexOf("/") + 1);

        logout();
        driver.get(url);
        checkAlert("Board not found");
        textNotPresent(boardDef);

        loginAs(ctepCurator_username, password);
        driver.get(url);
        // logged in as someone else, I can't see
        checkAlert("Board not found");
        textNotPresent(boardDef);

        logout();

        loginAs(boardUser, password);
        makePublic(boardName);

        logout();
        driver.get(url);
        // Now I can see;
        textPresent("MUGA");

        loginAs(boardUser, password);
        gotoMyBoards();
        int length = driver.findElements(By.linkText("View Board")).size();
        for (int i = 0; i < length; i++) {
            String name = findElement(By.id("dd_name_" + i)).getText();
            if (boardName.equals(name)) {
                clickElement(By.id("publicIcon_" + i));
                clickElement(By.id("confirmChangeStatus_" + i));
                wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("privateIcon_" + i)));
                i = length;
            }
        }

        logout();

        driver.get(url);
        // private again, I can't see
        textNotPresent("Not a very useful");
    }

}
