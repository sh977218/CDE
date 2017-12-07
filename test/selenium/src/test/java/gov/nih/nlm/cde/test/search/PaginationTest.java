package gov.nih.nlm.cde.test.search;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class PaginationTest extends NlmCdeBaseTest {

    @Test
    public void paginationTest() {
        goToCdeSearch();
        findElement(By.id("ftsearch-input")).sendKeys("patient");
        clickElement(By.id("search.submit"));
        clickElement(By.id("li-blank-NINDS"));
        clickElement(By.id("li-blank-Disease"));
        hangon(2);
        clickElement(By.id("li-blank-Qualified"));
        clickElement(By.linkText("»"));
        hangon(2);
        checkSearchResultInfo("patient", "NINDS > Disease", null, "All Topics", "Qualified", null);
    }

}
