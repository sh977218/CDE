package gov.nih.nlm.cde.test.boards;

import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class PinAllMoreThan20 extends BoardTest {

    @Test
    public void pinAllMoreThan20() {
        String board_name = "Pin All More Than 20 Test Board";
        mustBeLoggedInAs(pinAllBoardUser_username, password);
        goToCdeSearch();
        clickElement(By.id("browseOrg-NINDS"));
        clickElement(By.id("li-blank-Disease"));
        clickElement(By.xpath("//*[@id='li-blank-Amyotrophic Lateral Sclerosis']"));
        clickElement(By.id("li-blank-Classification"));
        clickElement(By.id("li-blank-Core"));
        hangon(3);
        int searchResultNum_int = Integer.parseInt(findElement(By.id("searchResultNum")).getText().trim());
        Assert.assertTrue(searchResultNum_int > 20);
        scrollToTop();
        clickElement(By.id("pinAll"));
        textPresent("Choose a Board to pin");
        clickElement(By.xpath("//*[@id='viewBoard_" + board_name + "']"));
        textPresent("All elements pinned.");
        gotoMyBoards();
        int num_cde_after_pinAll_int =
                Integer.valueOf(findElement(By.xpath("//*[@data-id = 'boardDiv_"
                        + board_name + "']//*[contains(@id, 'board_num_cdes_')]")).getText());
        Assert.assertEquals(searchResultNum_int, num_cde_after_pinAll_int);
    }
}
