package gov.nih.nlm.cde.test.search;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.util.List;

public class CdeSearchTest3 extends NlmCdeBaseTest {

    @Test
    public void phraseSearch() {
        goToCdeSearch();
        findElement(By.name("ftsearch")).sendKeys("Biomarker Gene");
        findElement(By.id("search.submit")).click();
        textPresent("Biomarker Gene");
        List<WebElement> linkList = driver.findElements(By.cssSelector("div.panel-default"));
        Assert.assertTrue(linkList.size() > 10);

        findElement(By.name("ftsearch")).clear();
        findElement(By.name("ftsearch")).sendKeys("\"Biomarker Gene\"");
        findElement(By.id("search.submit")).click();
        textPresent("caBIG (1)");

        textPresent("Biomarker Gene");
        textPresent("1 results for");
        linkList = driver.findElements(By.cssSelector("div.panel-default"));
        Assert.assertEquals(linkList.size(), 1);
    }

    @Test
    public void starSearch() {
        goToCdeSearch();
        findElement(By.name("ftsearch")).sendKeys("ISO2109");
        findElement(By.id("search.submit")).click();
        Assert.assertTrue(textPresent("No results were found."));

        goToCdeSearch();
        findElement(By.name("ftsearch")).sendKeys("ISO2109*");
        findElement(By.id("search.submit")).click();
        List<WebElement> linkList = driver.findElements(By.cssSelector("div.panel-default"));
        Assert.assertTrue(linkList.size() > 10);
        Assert.assertTrue(textPresent("ISO21090.ST"));

    }

    @Test
    public void openAllButton() {
        goToCdeSearch();
        for (int i = 0; i < 19; i++) {
            wait.until(ExpectedConditions.elementToBeClickable(By.id("acc_link_" + i)));
        }
        findElement(By.id("openAllCb")).click();
        for (int i = 0; i < 19; i++) {
            wait.until(ExpectedConditions.elementToBeClickable(By.id("acc_link_" + i)));
        }
    }

}