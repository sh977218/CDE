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
        WebElement pagElt = findElement(By.cssSelector("ul.pagination"));
        findElement(By.linkText("10"));
        List<WebElement> linkList = pagElt.findElements(By.cssSelector("a"));
        Assert.assertEquals(linkList.size(), 12);
    }

    @Test
    public void viewIncrement() {
        goHome();
        goToCdeByName("Tissue Donor Genetic Testing Other Disease or Disorder Specify");
        textNotPresent("Views");
        for (int i =0 ; i < 10; i++) {
            goToCdeByName("Tissue Donor Genetic Testing Other Disease or Disorder Specify");
            textPresent("Someone who gives blood");
        }
        int nbOfViews = Integer.valueOf(findElement(By.id("dd_views")).getText());
        textPresent("Views");
        Assert.assertEquals(nbOfViews, 10);
    }

    @Test
    public void relatedConcepts() {
        goToCdeByName("Patient Visual Change Chief Complaint Indicator");
        findElement(By.linkText("Concepts")).click();
        findElement(By.linkText("Change")).click();
        textPresent("Specimen Inflammation Change Type");
        textNotPresent("Patient Visual Change Chief Complaint Indicator", By.cssSelector("accordion"));
    }

    @Test
    public void usedBySummary() {
        goToCdeSearch();
        openCdeInList("Patient Race Category");
        String usedBy = findElement(By.id("dd_usedBy")).getText();
        Assert.assertTrue(usedBy.contains("NIDCR"));
        Assert.assertTrue(usedBy.contains("PS&CC"));
        Assert.assertTrue(usedBy.contains("caBIG"));
        Assert.assertTrue(usedBy.contains("NHLBI"));
        Assert.assertTrue(usedBy.contains("CCR"));
        Assert.assertTrue(usedBy.contains("CIP"));
    }

    @Test
    public void badESQuery() {
        goToCdeSearch();
        findElement(By.id("ftsearch-input")).clear();
        findElement(By.id("ftsearch-input")).sendKeys("+-aaa");
        findElement(By.cssSelector("i.fa-search")).click();
        textPresent("There was a problem with your query");
    }
}
