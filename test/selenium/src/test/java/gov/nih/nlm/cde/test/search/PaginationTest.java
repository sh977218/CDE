package gov.nih.nlm.cde.test.search;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class PaginationTest extends NlmCdeBaseTest {

    @Test
    public void paginationTest() {
        goToCdeSearch();
        findElement(By.id("ftsearch-input")).sendKeys("patient");
        findElement(By.id("search.submit")).click();
        findElement(By.id("li-blank-NINDS")).click();
        findElement(By.id("li-blank-Disease")).click();
        hangon(2);
        findElement(By.id("li-blank-Qualified")).click();
        findElement(By.linkText("Next")).click();
        hangon(2);
        textPresent("results for patient | NINDS > Disease | Qualified");
    }

}
