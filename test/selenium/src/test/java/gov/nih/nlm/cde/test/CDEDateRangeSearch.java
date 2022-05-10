package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class CDEDateRangeSearch extends NlmCdeBaseTest {

    @Test
    public void cdeDateRangeSearch() {
        goToCdeSearch();
        findElement(By.id("ftsearch-input")).sendKeys("created:<2015-05-14");
        clickElement(By.id("search.submit"));
        textPresent("created:<2015-05-14", By.className("searchFilterLayoutActive"));
        Assert.assertTrue(getNumberOfResults() > 850);

        findElement(By.id("ftsearch-input")).clear();
        findElement(By.id("ftsearch-input")).sendKeys("created:<1960-05-13");
        clickElement(By.id("search.submit"));
        textPresent("No results were found.");

        findElement(By.id("ftsearch-input")).clear();
        findElement(By.id("ftsearch-input")).sendKeys("updated:<2015-09-21");
        clickElement(By.id("search.submit"));
        textPresent("No results were found.");

        findElement(By.id("ftsearch-input")).clear();
        findElement(By.id("ftsearch-input")).sendKeys("updated:<2015-09-22");
        clickElement(By.id("search.submit"));
        textPresent("updated:<2015-09-22", By.className("searchFilterLayoutActive"));
        Assert.assertTrue(getNumberOfResults() > 9790);

        findElement(By.id("ftsearch-input")).clear();
        findElement(By.id("ftsearch-input")).sendKeys("imported:<2014-12-10");
        clickElement(By.id("search.submit"));
        textPresent("No results were found.");

        findElement(By.id("ftsearch-input")).clear();
        findElement(By.id("ftsearch-input")).sendKeys("imported:<2014-12-11");
        clickElement(By.id("search.submit"));
        textPresent("imported:<2014-12-11", By.className("searchFilterLayoutActive"));
        Assert.assertTrue(getNumberOfResults() > 330);
    }

}
