package gov.nih.nlm.cde.test.boards;

import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class PinAllTest extends BoardTest {

    @Test
    public void pinAll() {
        String board_name = "Cerebral Palsy > Public Review";
        String board_description = "CDEs to be use for Cerebral Palsy";
        mustBeLoggedInAs(ninds_username, password);
        createBoard(board_name, board_description);
        String num_cde_before_pinAll_string = goToBoardOf();
        int num_cde_before_pinAll_int = Integer.parseInt(num_cde_before_pinAll_string);
        goToCdeSearch();
        hangon(1);
        findElement(By.id("resetSearch")).click();
        hangon(1);
        findElement(By.id("pinAll")).click();
        hangon(1);
        findElement(By.linkText("Cerebral Palsy > Public Review")).click();
        hangon(1);
        String num_cde_after_pinAll_string = goToBoardOf();
        int num_cde_after_pinAll_int = Integer.parseInt(num_cde_after_pinAll_string);
        System.out.println("num_cde_before_pinAll_int:" + num_cde_before_pinAll_int);
        System.out.println("num_cde_after_pinAll_int:" + num_cde_after_pinAll_int);
        Assert.assertEquals(num_cde_before_pinAll_int + 20, num_cde_after_pinAll_int);
    }

    private String goToBoardOf() {
        findElement(By.id("boardsMenu")).click();
        hangon(1);
        findElement(By.linkText("My Boards")).click();
        hangon(1);
        // this could be better if find the number based on the board name
        // if there are more than 1 board in My Boards, there might be problem
        String num_Cdes_String = findElement(By.id("dd_numb_0")).getText();
        return num_Cdes_String;
    }
}
