package gov.nih.nlm.board.cde;

import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.annotations.Test;

public class PublicVsPrivateBoard extends BoardTest {

    @Test
    public void publicVsPrivateBoards() {
        mustBeLoggedInAs(boardUser, password);
        String boardName = "Public Board";

        pinCdeToBoard("Heart MUGA Test Date", boardName);
        // by default, boards is private.

        goToBoard(boardName);
        // I can view my own boards.
        textPresent("MUGA");
        String url = driver.getCurrentUrl();

        logout();
        driver.get(url);
        checkAlert("Board Not Found");
        textNotPresent("MUGA");

        loginAs(ctepEditor_username, password);
        driver.get(url);
        // logged in as someone else, I can't see
        checkAlert("Board Not Found");
        textNotPresent("MUGA");
        logout();

        loginAs(boardUser, password);
        makePublic(boardName);
        logout();
        driver.get(url);
        // Now I can see;
        textPresent("MUGA");

        loginAs(boardUser, password);
        makePrivate(boardName);
        logout();
        driver.get(url);
        // private again, I can't see
        textNotPresent("MUGA");
    }

}
