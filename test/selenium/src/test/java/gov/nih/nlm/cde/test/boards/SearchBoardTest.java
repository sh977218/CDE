package gov.nih.nlm.cde.test.boards;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class SearchBoardTest extends BoardTest {
    @Test
    public void searchBoard() {
        mustBeLoggedInAs(boardSearchUser_username, password);
        String pubBlood = "Public Blood Board";

        gotoPublicBoards();

        findElement(By.name("search")).sendKeys("Blood");
        clickElement(By.id("search.submit"));

        textPresent(pubBlood);

        textNotPresent("Smoking");
        textNotPresent("Private");
    }

}