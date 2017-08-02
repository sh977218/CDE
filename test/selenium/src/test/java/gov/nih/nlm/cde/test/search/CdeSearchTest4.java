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
    public void viewIncrement() {
        goHome();
        goToCdeByName("Tissue Donor Genetic Testing Other Disease or Disorder Specify");
        textNotPresent("Views");
        for (int i = 0; i < 10; i++) {
            goToCdeByName("Tissue Donor Genetic Testing Other Disease or Disorder Specify");
            textPresent("Someone who gives blood");
        }
        int nbOfViews = Integer.valueOf(findElement(By.id("dd_views")).getText());
        textPresent("Views");
        Assert.assertEquals(nbOfViews, 9);
    }

    @Test
    public void usedBySummary() {
        goToCdeSearch();
        try {
            openCdeInList("Patient Race Category");
        } catch (Exception e) {
            waitForESUpdate();
            openCdeInList("Patient Race Category");
        }
        String usedBy = findElement(By.id("dd_usedBy")).getText();
        Assert.assertTrue(usedBy.contains("NIDCR"));
        Assert.assertTrue(usedBy.contains("PS&CC"));
        Assert.assertTrue(usedBy.contains("caBIG"));
        Assert.assertTrue(usedBy.contains("NHLBI"));
        Assert.assertTrue(usedBy.contains("CCR"));
        Assert.assertTrue(usedBy.contains("CIP"));
    }

}
