package gov.nih.nlm.board.cde;

import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class PinAllMoreThan20 extends BoardTest {

    @Test
    public void pinAllMoreThan20() {
        String boardName = "Pin All More Than 20 Test Board";
        mustBeLoggedInAs(pinAllBoardUser_username, password);
        goToCdeSearch();
        clickElement(By.id("browseOrg-NINDS"));
        clickElement(By.id("classif-Disease"));
        clickElement(By.id("classif-Amyotrophic Lateral Sclerosis"));
        clickElement(By.id("classif-Classification"));
        clickElement(By.id("classif-Core"));
        hangon(3);
        int searchResultNum_int = getNumberOfResults();
        Assert.assertTrue(searchResultNum_int > 20);
        scrollToTop();
        clickElement(By.id("pinAll"));
        textPresent("Choose a Board to pin");
        clickBoardHeaderByName(boardName);
        textPresent("All elements pinned");
        gotoMyBoards();
        int num_cde_after_pinAll_int = getNumberElementsByBoardName(boardName);
        Assert.assertEquals(searchResultNum_int, num_cde_after_pinAll_int);
    }

}
