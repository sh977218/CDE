package gov.nih.nlm.cde.test.search;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class PaginationTest extends NlmCdeBaseTest {

    @Test
    public void basicPagination() {
        goToCdeSearch();
        clickElement(By.id("browseOrg-NINDS"));
        textPresent("1 – 20 of 10000");
        clickElement(By.cssSelector("button.mat-paginator-navigation-next"));
        textPresent("21 – 40 of 10000");
    }

    @Test
    public void paginationTest() {
        goToCdeSearch();
        findElement(By.id("ftsearch-input")).sendKeys("patient");
        clickElement(By.id("search.submit"));
        clickElement(By.id("classif-NINDS"));
        clickElement(By.id("classif-Disease"));
        hangon(2);
        clickElement(By.id("regstatus-Qualified"));
        clickElement(By.cssSelector("button.mat-paginator-navigation-next"));
        hangon(2);
        checkSearchResultInfo("patient", "NINDS > Disease", null, "Qualified", null);
    }

}
