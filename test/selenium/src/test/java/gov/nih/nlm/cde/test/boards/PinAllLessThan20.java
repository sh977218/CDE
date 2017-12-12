package gov.nih.nlm.cde.test.boards;

import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class PinAllLessThan20 extends BoardTest {

    @Test
    public void pinAllLessThan20() {
        String board_name = "Pin All Less Than 20 Test Board";
        mustBeLoggedInAs(pinAllBoardUser_username, password);
        goToCdeSearch();

        clickElement(By.id("browseOrg-NINDS"));
        clickElement(By.id("li-blank-Disease"));
        clickElement(By.id("li-blank-Stroke"));
        clickElement(By.id("li-blank-Classification"));
        clickElement(By.id("li-blank-Exploratory"));
        textPresent("9 results for All Terms");
        int searchResultNum_int = Integer.parseInt(findElement(By.id("searchResultNum")).getText().trim());
        clickElement(By.id("pinAll"));
        textPresent("Choose a Board to pin");
        clickElement(By.linkText(board_name));
        checkAlert("All elements pinned.");
        waitForESUpdate();
        gotoMyBoards();

        // find nb of cdes for the boards.
        int num_cde_after_pinAll_int =
                Integer.valueOf(findElement(By.xpath("//*[@id = 'boardDiv_"
                        + board_name + "']//*[contains(@id, 'board_num_cdes_')]")).getText());
        Assert.assertEquals(searchResultNum_int, num_cde_after_pinAll_int);
    }

}
