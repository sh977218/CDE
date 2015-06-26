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
        findElement(By.id("browseOrg-caCORE")).click();
        textPresent("caCORE 3.2");
        findElement(By.id("li-blank-caCORE")).click();
        findElement(By.id("li-blank-CSM")).click();
        textPresent("2 results");
        List<WebElement> linkList = driver.findElements(By.cssSelector("div.panel-default"));
        Assert.assertEquals(linkList.size(), 2);
        findElement(By.id("resetSearch")).click();
        textPresent("10");
        linkList = driver.findElements(By.cssSelector("div.panel-default"));
        Assert.assertTrue(linkList.size() > 10);

        findElement(By.id("li-blank-caCORE")).click();
        textPresent("caCORE 3.2");
        findElement(By.id("li-blank-caCORE")).click();
        findElement(By.id("li-blank-CSM")).click();
        textPresent("2 results");

    }
}
