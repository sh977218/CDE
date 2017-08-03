package gov.nih.nlm.cde.test.search;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.util.List;

public class ResetSearchTest extends NlmCdeBaseTest {

    @Test
    public void resetSearch() {
        goToCdeSearch();
        scrollToViewById("browseOrg-caCORE");
        findElement(By.id("browseOrg-caCORE")).click();
        textPresent("caCORE 3.2");
        findElement(By.id("li-blank-caCORE")).click();
        findElement(By.id("li-blank-CSM")).click();
        textPresent("2 results");
        List<WebElement> linkList = driver.findElements(By.cssSelector("div.singleSearchResult"));
        Assert.assertEquals(linkList.size(), 2);
        findElement(By.id("menu_cdes_link")).click();
        textPresent("Browse by Classification");
        findElement(By.id("browseOrg-NINDS")).click();
        textPresent("Population (");
        linkList = driver.findElements(By.cssSelector("div.singleSearchResult"));
        Assert.assertTrue(linkList.size() > 10);
    }


    @Test
    public void resetFromWelcome() {
        goToCdeSearch();
        findElement(By.id("ftsearch-input")).sendKeys("some search");
        findElement(By.id("search.submit")).click();
        textPresent("results for some search");
        findElement(By.id("menu_cdes_link")).click();
        textPresent("Browse by Classification");
    }

}
