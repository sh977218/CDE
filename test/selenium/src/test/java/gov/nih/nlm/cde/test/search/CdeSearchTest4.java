package gov.nih.nlm.cde.test.search;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.util.List;

public class CdeSearchTest4 extends NlmCdeBaseTest {
    @Test
    public void basicPagination() {
        goToCdeSearch();
        clickElement(By.id("browseOrg-NINDS"));
        WebElement pagElt = findElement(By.cssSelector("ul.pagination"));
        findElement(By.linkText("10"));
        List<WebElement> linkList = pagElt.findElements(By.cssSelector("a"));
        Assert.assertEquals(linkList.size(), 14);
    }


    @Test
    public void usedBySummary() {
        goToCdeSearch();
        openCdeInList("Patient Race Category");
<<<<<<< HEAD
        String usedBy = findElement(By.id("dd_usedBy")).getText();
=======
        String usedBy = findElement(By.id("usedBy")).getText();
>>>>>>> a4c2c09004e5f4c0a0cad543a08f8f9701b450a9
        Assert.assertTrue(usedBy.contains("NIDCR"));
        Assert.assertTrue(usedBy.contains("PS&CC"));
        Assert.assertTrue(usedBy.contains("caBIG"));
        Assert.assertTrue(usedBy.contains("NHLBI"));
        Assert.assertTrue(usedBy.contains("CCR"));
        Assert.assertTrue(usedBy.contains("CIP"));

        clickElement(By.id("linkToElt_0"));
        textPresent("Source: caDSR");
        usedBy = findElement(By.id("dd_usedBy")).getText();
        Assert.assertTrue(usedBy.contains("NIDCR"));
        Assert.assertTrue(usedBy.contains("PS&CC"));
        Assert.assertTrue(usedBy.contains("caBIG"));
        Assert.assertTrue(usedBy.contains("NHLBI"));
        Assert.assertTrue(usedBy.contains("CCR"));
        Assert.assertTrue(usedBy.contains("CIP"));

    }

}
