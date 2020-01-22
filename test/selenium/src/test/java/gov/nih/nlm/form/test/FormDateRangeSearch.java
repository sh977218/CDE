package gov.nih.nlm.form.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormDateRangeSearch extends NlmCdeBaseTest {

    @Test
    public void formDateRangeSearch() {
        goToFormSearch();
        findElement(By.id("ftsearch-input")).sendKeys("created:<2015-01-01 AND created:>1980-01-01");
        clickElement(By.id("search.submit"));
        textPresent("1 results");

        findElement(By.id("ftsearch-input")).clear();
        findElement(By.id("ftsearch-input")).sendKeys("created:<1960-01-01");
        clickElement(By.id("search.submit"));
        textPresent("No results were found.");

        findElement(By.id("ftsearch-input")).clear();
        findElement(By.id("ftsearch-input")).sendKeys("updated:<2015-01-01");
        clickElement(By.id("search.submit"));
        textPresent("No results were found.");

        findElement(By.id("ftsearch-input")).clear();
        findElement(By.id("ftsearch-input")).sendKeys("updated:<2016-01-01");
        clickElement(By.id("search.submit"));
        textPresent("4 results");

        findElement(By.id("ftsearch-input")).clear();
        findElement(By.id("ftsearch-input")).sendKeys("imported:<2015-01-01");
        clickElement(By.id("search.submit"));
        textPresent("No results were found.");

        findElement(By.id("ftsearch-input")).clear();
        findElement(By.id("ftsearch-input")).sendKeys("imported:<2016-01-01");
        clickElement(By.id("search.submit"));
        textPresent("2 results");
    }

}
