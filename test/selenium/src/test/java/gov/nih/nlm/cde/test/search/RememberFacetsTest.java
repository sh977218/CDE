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
        findElement(By.id("browseOrg-caCORE")).click();
        findElement(By.id("li-blank-caCORE")).click();
        findElement(By.id("li-blank-CSM")).click();
        textPresent("2 results for");
        List<WebElement> linkList = driver.findElements(By.cssSelector("div.panel-default"));
        Assert.assertEquals(linkList.size(), 2);
        findElement(By.id("eyeLink_0")).click();
        textPresent("More Like This");
        driver.navigate().back();
        textPresent("User First Name");
        linkList = driver.findElements(By.cssSelector("div.panel-default"));
        Assert.assertEquals(linkList.size(), 2);
    }


}
