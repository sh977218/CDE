package gov.nih.nlm.cde.test.search;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.util.List;

public class RememberFacetsTest extends NlmCdeBaseTest {

    @Test
    public void rememberFacets() {
        goToCdeSearch();
        clickElement(By.id("browseOrg-caCORE"));
        clickElement(By.xpath("//*[@id='classif-caCORE' and contains(@class, 'treeChild')]"));
        clickElement(By.id("classif-CSM"));
        textPresent("2 data element results for");
        List<WebElement> linkList = driver.findElements(By.cssSelector("div.singleSearchResult"));
        Assert.assertEquals(linkList.size(), 2);
        clickElement(By.id("linkToElt_0"));

        textPresent("More Like This");
        driver.navigate().back();
        textPresent("User First Name");
        linkList = driver.findElements(By.cssSelector("div.singleSearchResult"));
        Assert.assertEquals(linkList.size(), 2);
    }


}
