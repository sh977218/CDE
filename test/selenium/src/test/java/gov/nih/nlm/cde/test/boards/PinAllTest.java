package gov.nih.nlm.cde.test.boards;

import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class PinAllTest extends BoardTest {

    @Test
    public void pinAll() {
        String board_name = "Cerebral Palsy > Public Review";
        String board_description = "CDEs to be use for Cerebral Palsy";
        mustBeLoggedInAs(pinAllBoardUser_username, password);
        createBoard(board_name, board_description);
        gotoMyBoards();
        String num_cde_before_pinAll_string = findElement(By.id("dd_numb_0")).getText();
        int num_cde_before_pinAll_int = Integer.parseInt(num_cde_before_pinAll_string);
        goToCdeSearch();
        hangon(1);
        findElement(By.id("resetSearch")).click();
        randomPick();
        hangon(2);
        findElement(By.id("pinAll")).click();
        hangon(1);
        findElement(By.linkText(board_name)).click();
        hangon(1);
        gotoMyBoards();
        String num_cde_after_pinAll_string = findElement(By.id("dd_numb_0")).getText();
        int num_cde_after_pinAll_int = Integer.parseInt(num_cde_after_pinAll_string);
        String searchResultNum_string = findElement(By.id("searchResultNum")).getText().trim();
        int searchResultNum_int = Integer.parseInt(searchResultNum_string);
        Assert.assertEquals(num_cde_before_pinAll_int + searchResultNum_int, num_cde_after_pinAll_int);
    }

    private void randomPick() {

    }
}
