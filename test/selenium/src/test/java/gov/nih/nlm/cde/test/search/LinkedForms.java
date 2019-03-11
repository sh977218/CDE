package gov.nih.nlm.cde.test.search;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class LinkedForms extends NlmCdeBaseTest {

    @Test
    public void linkedFormx() {
        goToCdeSearch();
        clickElement(By.id("browseOrg-PROMIS / Neuro-QOL"));
        findElement(By.id("ftsearch-input")).sendKeys("linkedForms.Retired:>0");
        clickElement(By.id("search.submit"));
        textPresent("7 results for");

        findElement(By.id("ftsearch-input")).clear();
        findElement(By.id("ftsearch-input")).sendKeys("linkedForms.Qualified:>1");
        textPresent("7 results for");

        findElement(By.id("ftsearch-input")).clear();
        findElement(By.id("ftsearch-input")).sendKeys("linkedForms.Qualified:>2");
        textPresent("0 results for");

        findElement(By.id("ftsearch-input")).clear();
        findElement(By.id("ftsearch-input")).sendKeys("linkedForms.Standard:>0");
        textPresent("0 results for");

        findElement(By.id("ftsearch-input")).clear();
        findElement(By.id("ftsearch-input")).sendKeys("linkedForms.Standard:0");
        textPresent("7 results for");
    }

}
