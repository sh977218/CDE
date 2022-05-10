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
        clickElement(By.id("search.submit"));
        textPresent("caBIG (9)");
        clickElement(By.id("classif-caBIG"));
        textPresent("Generic Image");

        textPresent("9 data element results");
        List<WebElement> linkList = driver.findElements(By.cssSelector("div.singleSearchResult"));
        Assert.assertEquals(linkList.size(), 9);

        // Check that CTEP classification with 0 items does not show
        Assert.assertTrue(!driver.findElement(By.cssSelector("BODY")).getText().contains("Radiograph Evidence Type"));

        clickElement(By.xpath("//*[@id='classif-Generic Image']"));
        textPresent("genericimage (2)");
        clickElement(By.id("classif-gov.nih.nci.ivi.genericimage"));
        textPresent("2 data element results");

        linkList = driver.findElements(By.cssSelector("div.singleSearchResult"));
        Assert.assertEquals(linkList.size(), 2);

        // Now test unclicking everything
        clickElement(By.id("classif-caBIG"));
        textPresent("9 data element results");
        linkList = driver.findElements(By.cssSelector("div.singleSearchResult"));
        Assert.assertEquals(linkList.size(), 9);

        textPresent("Generic Image (2)");
        clickElement(By.id("classif-Generic Image"));

        textPresent("2 data element results");
        linkList = driver.findElements(By.cssSelector("div.singleSearchResult"));
        Assert.assertEquals(linkList.size(), 2);

        clickElement(By.className("classif_crumb"));
        textPresent("NINDS (");
        Assert.assertTrue(getNumberOfResults() > 90);
    }
}
