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
        clickElement(By.id("browseOrg-caCORE"));
        textPresent("caCORE 3.2");
        clickElement(By.id("li-blank-caCORE"));
        clickElement(By.id("li-blank-CSM"));
        textPresent("2 results");
        List<WebElement> linkList = driver.findElements(By.cssSelector("div.singleSearchResult"));
        Assert.assertEquals(linkList.size(), 2);
        clickElement(By.id("menu_cdes_link"));
        textPresent("Browse by Classification");
        clickElement(By.id("browseOrg-NINDS"));
        textPresent("Population (");
        linkList = driver.findElements(By.cssSelector("div.singleSearchResult"));
        Assert.assertTrue(linkList.size() > 10);
    }


    @Test
    public void resetFromWelcome() {
        goToCdeSearch();
        findElement(By.id("ftsearch-input")).sendKeys("some search");
        clickElement(By.id("search.submit"));
        textPresent("results for some search");
        clickElement(By.id("menu_cdes_link"));
        textPresent("Browse by Classification");
    }

}
