package gov.nih.nlm.cde.test.boards;

import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class BoardManagement3Test extends BoardTest {

    @Test(priority = 3)
    public void editBoard() {
        mustBeLoggedInAs(boarduserEdit_username, password);
        createBoard("Edit Board", "Test");
        gotoMyBoards();
        String modified = findElement(By.id("board_mod_0")).getText();
        clickElement(By.id("edit_board_0"));
        findElement(By.id("name_input_0")).sendKeys(" -- Name Edited");

        clickElement(By.id("desc_edit_0"));
        findElement(By.id("desc_input_0")).sendKeys(" -- Desc Edited");
        clickElement(By.id("confirmEdit_0"));

        goToCdeSearch();
        gotoMyBoards();
        textPresent("-- Name Edited");
        textPresent("-- Desc Edited");

        Assert.assertNotEquals(modified + " --- " + findElement(By.id("dd_mod")).getText(), modified, findElement(By.id("dd_mod")).getText());

        removeBoard("Edit Board -- Name Edited");
    }

    @Test
    public void searchBoard() {
        mustBeLoggedInAs(boardSearchUser_username, password);
        String pubBlood = "Public Blood Board";
        String privBlood = "Private Blood Board";
        String pubSmoking = "Public Smoking Board";

        createBoard(pubBlood, "");
        createBoard(privBlood, "");
        createBoard(pubSmoking, "");

        makePublic(pubBlood);
        makePublic(pubSmoking);

        modalGone();
        gotoPublicBoards();

        findElement(By.name("search")).sendKeys("Blood");
        findElement(By.id("search.submit")).click();

        textPresent(pubBlood);

        textNotPresent("Smoking");
        textNotPresent("Private");

        removeBoard(pubBlood);
        removeBoard(privBlood);
        removeBoard(pubSmoking);

    }

}
