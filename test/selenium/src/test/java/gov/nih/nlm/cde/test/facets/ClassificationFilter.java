package gov.nih.nlm.cde.test.facets;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.util.List;

public class ClassificationFilter extends NlmCdeBaseTest {

    @Test
    public void classificationFilters() {
        goToCdeSearch();
        findElement(By.name("q")).sendKeys("Image");
        findElement(By.id("search.submit")).click();
        textPresent("caBIG (8)");
        findElement(By.id("li-blank-caBIG")).click();
        textPresent("Generic Image");

        textPresent("8 results for");
        List<WebElement> linkList = driver.findElements(By.cssSelector("div.panel-default"));
        Assert.assertEquals(linkList.size(), 8);

        // Check that CTEP classification with 0 items does not show
        Assert.assertTrue(!driver.findElement(By.cssSelector("BODY")).getText().contains("Radiograph Evidence Type"));

        findElement(By.id("li-blank-Generic Image")).click();
        textPresent("genericimage (2)");
        findElement(By.id("li-blank-gov.nih.nci.ivi.genericimage")).click();
        textPresent("2 results for");

        linkList = driver.findElements(By.cssSelector("div.panel-default"));
        Assert.assertEquals(linkList.size(), 2);

        // Now test unclicking everything
        findElement(By.id("li-checked-Generic Image")).click();
        textPresent("8 results for");
        linkList = driver.findElements(By.cssSelector("div.panel-default"));
        Assert.assertEquals(linkList.size(), 8);

        textPresent("Generic Image (2)");
        findElement(By.id("li-blank-Generic Image")).click();

        textPresent("2 results for");
        linkList = driver.findElements(By.cssSelector("div.panel-default"));
        Assert.assertEquals(linkList.size(), 2);

        findElement(By.id("li-checked-caBIG")).click();
        textPresent("92 results for");
    }

}
