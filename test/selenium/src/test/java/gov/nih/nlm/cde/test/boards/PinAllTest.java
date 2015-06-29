package gov.nih.nlm.cde.test.boards;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.util.List;

public class PinAllTest extends BoardTest {

    @Test
    public void pinAll() {
        String board_name = "Pin All Test Board";
        String board_description = "This board is only for pin all test.";
        mustBeLoggedInAs(pinAllBoardUser_username, password);
        createBoard(board_name, board_description);
        int num_cde_before_pinAll_int = 0;
        goToCdeSearch();
        hangon(1);
        findElement(By.id("resetSearch")).click();
        randomPickClassification();
        hangon(1);
        randomPickRegistrationStatus();
        hangon(1);
        String searchResultNum_string = findElement(By.id("searchResultNum")).getText().trim();
        int searchResultNum_int = Integer.parseInt(searchResultNum_string);
        hangon(1);
        findElement(By.id("pinAll")).click();
        hangon(1);
        findElement(By.linkText(board_name)).click();
        hangon(1);
        gotoMyBoards();
        String num_cde_after_pinAll_string = findElement(By.id("dd_numb_0")).getText();
        int num_cde_after_pinAll_int = Integer.parseInt(num_cde_after_pinAll_string);
        Assert.assertEquals(num_cde_before_pinAll_int + searchResultNum_int, num_cde_after_pinAll_int);
    }
    
}
