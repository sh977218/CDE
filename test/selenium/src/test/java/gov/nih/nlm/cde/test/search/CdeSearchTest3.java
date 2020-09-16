package gov.nih.nlm.cde.test.search;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.util.List;

public class CdeSearchTest3 extends NlmCdeBaseTest {

    @Test
    public void phraseSearch() {
        goToCdeSearch();
        findElement(By.name("q")).sendKeys("Biomarker Gene");
        findElement(By.id("search.submit")).click();
        textPresent("Biomarker Gene");
        List<WebElement> linkList = driver.findElements(By.cssSelector("div.singleSearchResult"));
        Assert.assertEquals(linkList.size(), 2);

        findElement(By.name("q")).clear();
        findElement(By.name("q")).sendKeys("\"Biomarker Gene\"");
        findElement(By.id("search.submit")).click();
        showSearchFilters();
        textPresent("caBIG (1)");

        textPresent("Biomarker Gene");
        textPresent("1 data element results for");
        linkList = driver.findElements(By.cssSelector("div.singleSearchResult"));
        Assert.assertEquals(linkList.size(), 1);
    }

    @Test
    public void starSearch() {
        goToCdeSearch();
        findElement(By.name("q")).sendKeys("ISO2109");
        findElement(By.id("search.submit")).click();
        textPresent("No results were found.");

        goToCdeSearch();
        findElement(By.name("q")).sendKeys("ISO2109*");
        findElement(By.id("search.submit")).click();
        List<WebElement> linkList = driver.findElements(By.cssSelector("div.singleSearchResult"));
        Assert.assertTrue(linkList.size() > 10);
        textPresent("ISO21090.ST");

    }

}
