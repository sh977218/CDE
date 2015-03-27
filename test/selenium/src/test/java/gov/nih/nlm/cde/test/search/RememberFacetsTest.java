package gov.nih.nlm.cde.test.search;

import gov.nih.nlm.cde.test.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.util.List;

public class RememberFacetsTest extends NlmCdeBaseTest {

    @Test
    public void rememberFacets() {
        goToCdeSearch();
        findElement(By.id("li-blank-caCORE")).click();
        findElement(By.id("li-blank-caCORE")).click();
        findElement(By.id("li-blank-CSM")).click();
        Assert.assertTrue(textPresent("2 results for"));
        List<WebElement> linkList = driver.findElements(By.cssSelector("div.panel-default"));
        Assert.assertEquals(linkList.size(), 2);
        findElement(By.id("acc_link_0")).click();
        hangon(1);
        findElement(By.xpath("//li[a = 'CDEs']")).click();
        Assert.assertTrue(textPresent("User First Name"));
        linkList = driver.findElements(By.cssSelector("div.panel-default"));
        Assert.assertEquals(linkList.size(), 2);
    }


}
