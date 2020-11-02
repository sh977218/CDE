package gov.nih.nlm.cde.test.search;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class CdeSearchTest4 extends NlmCdeBaseTest {

    @Test
    public void usedBySummary() {
        goToCdeSearch();
        openCdeInList("Patient Race Category");
        String usedBy = findElement(By.id("usedBy_0")).getText();
        Assert.assertTrue(usedBy.contains("NIDCR"));
        Assert.assertTrue(usedBy.contains("PS&CC"));
        Assert.assertTrue(usedBy.contains("caBIG"));
        Assert.assertTrue(usedBy.contains("NHLBI"));
        Assert.assertTrue(usedBy.contains("CCR"));
        Assert.assertTrue(usedBy.contains("CIP"));

        clickElement(By.id("linkToElt_0"));
        textPresent("Source: caDSR");
        usedBy = findElement(By.cssSelector("[itemprop='usedBy']")).getText();
        Assert.assertTrue(usedBy.contains("NIDCR, "));
        Assert.assertTrue(usedBy.contains("PS&CC"));
        Assert.assertTrue(usedBy.contains("caBIG"));
        Assert.assertTrue(usedBy.contains("NHLBI"));
        Assert.assertTrue(usedBy.contains("CCR"));
        Assert.assertTrue(usedBy.contains("CIP"));
        
    }

}
