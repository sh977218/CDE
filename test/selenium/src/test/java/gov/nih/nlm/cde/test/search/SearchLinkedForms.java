package gov.nih.nlm.cde.test.search;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class SearchLinkedForms extends NlmCdeBaseTest {

    @Test
    public void searchLinkedForms() {
        goToCdeSearch();
        clickElement(By.id("browseOrg-PROMIS / Neuro-QOL"));

        int i = 0;
        while (i > -1) {
            Assert.assertTrue(i < 10);
            try {
                findElement(By.id("ftsearch-input")).clear();
                findElement(By.id("ftsearch-input")).sendKeys("linkedForms.Retired:>0");
                clickElement(By.id("search.submit"));
                textPresent("7 data element results for");
                i = -1;
            } catch (Exception e) {
                i++;
            }
        }

        findElement(By.id("ftsearch-input")).clear();
        findElement(By.id("ftsearch-input")).sendKeys("linkedForms.Qualified:>1");
        clickElement(By.id("search.submit"));
        textPresent("7 data element results for");

        hangon(1);

        findElement(By.id("ftsearch-input")).clear();
        findElement(By.id("ftsearch-input")).sendKeys("linkedForms.Qualified:>2");
        clickElement(By.id("search.submit"));
        textPresent("0 data element results for");

        findElement(By.id("ftsearch-input")).clear();
        findElement(By.id("ftsearch-input")).sendKeys("linkedForms.Standard:>0");
        clickElement(By.id("search.submit"));
        textPresent("0 data element results for");

        findElement(By.id("ftsearch-input")).clear();
        findElement(By.id("ftsearch-input")).sendKeys("linkedForms.Standard:0");
        clickElement(By.id("search.submit"));
        textPresent("7 data element results for");
    }

}
