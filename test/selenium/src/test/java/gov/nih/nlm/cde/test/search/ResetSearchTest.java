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
        clickElement(By.xpath("//*[@id='classif-caCORE' and contains(@class, 'treeChild')]"));
        clickElement(By.id("classif-CSM"));
        textPresent("2 data element results for");
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
        String searchTerm = "some search";
        goToCdeSearch();
        findElement(By.id("ftsearch-input")).sendKeys(searchTerm);
        clickElement(By.id("search.submit"));
        textPresent("results for some search");
        clickElement(By.id("menu_cdes_link"));
        textPresent("Browse by Classification");
        String actual = findElement(By.id("ftsearch-input")).getAttribute("value");
        Assert.assertNotEquals(actual, searchTerm, "Actual searchTerm: " + actual + " Previous searchTerm: " + searchTerm);
        textPresent("Browse by Classification");
    }

}
