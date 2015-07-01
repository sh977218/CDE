package gov.nih.nlm.cde.test.boards;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.util.List;

public class PinAllTest extends BoardTest {

    @Test
    public void pinAllLessThan20() {
        String board_name = "Pin All Test Board";
        String board_description = "Pin All less than 20 board.";
        mustBeLoggedInAs(pinAllBoardUser_username, password);
        createBoard(board_name, board_description);
        goToCdeSearch();

        findElement(By.id("li-blank-SPOREs")).click();
        hangon(3);

        int searchResultNum_int = Integer.parseInt(findElement(By.id("searchResultNum")).getText().trim());
        findElement(By.id("pinAll")).click();
        textPresent("Select Board");
        findElement(By.linkText(board_name)).click();
        textPresent("All elements pinned.");
        gotoMyBoards();

        // find nb of cdes for the board.
        int num_cde_after_pinAll_int =
                Integer.valueOf(findElement(By.xpath("//*[@data-id = 'boardDiv_"
                        + board_name + "']//*[contains(@id, 'dd_numb_')]")).getText());
        Assert.assertEquals(searchResultNum_int, num_cde_after_pinAll_int);
        removeBoard(board_name);
    }

    @Test
    public void pinAllMoreThan20() {
        String board_name = "Pin All More Than 20 Test Board";
        String board_description = "This board is only for pin all more than 20 test.";
        mustBeLoggedInAs(pinAllBoardUser_username, password);
        createBoard(board_name, board_description);
        goToCdeSearch();
        findElement(By.id("li-blank-CTEP")).click();
        hangon(3);
        findElement(By.id("li-blank-Qualified")).click();
        hangon(3);
        int searchResultNum_int = Integer.parseInt(findElement(By.id("searchResultNum")).getText().trim());
        Assert.assertTrue(searchResultNum_int > 20);
        findElement(By.id("pinAll")).click();
        textPresent("Select Board");
        findElement(By.linkText(board_name)).click();
        textPresent("All elements pinned.");
        gotoMyBoards();
        int num_cde_after_pinAll_int =
                Integer.valueOf(findElement(By.xpath("//*[@data-id = 'boardDiv_"
                        + board_name + "']//*[contains(@id, 'dd_numb_')]")).getText());
        Assert.assertEquals(searchResultNum_int, num_cde_after_pinAll_int);
        removeBoard(board_name);
    }
    
}
