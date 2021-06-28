package gov.nih.nlm.board.cde;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class CdeBoardsTest extends BoardTest {

    @Test
    public void pagination() {
        mustBeLoggedInAs(ninds_username, password);
        goToBoard("Large Board");
        for(int i = 0; i< 9; i++) {
            clickElement(By.cssSelector(".mat-paginator-navigation-next"));
            hangon(1);
        }
        textPresent("The indicator whether participant/subject worked in landscaping/gardening/groundskeeping from age 36 to 45 as part of the Risk Factor Questionnaire (RFQ-U) for Pesticide (Work).");
    }

}
