package gov.nih.nlm.cde.test;

import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class HomeTest extends NlmCdeBaseTest {
    
    @Test
    public void testSearchBox() {
        goHome();
        findElement(By.id("selectOrgDropdown")).click();
        Assert.assertTrue(textPresent("All Classifications"));
        Assert.assertTrue(textPresent("NINDS"));
        Assert.assertTrue(textPresent("CTEP"));
        findElement(By.linkText("CTEP")).click();

        findElement(By.id("searchTerms")).click();
        findElement(By.id("quickSearchButton"));
        findElement(By.id("quickSearchReset"));
    }
    
    @Test
    public void testReset() {
        goHome();
        findElement(By.id("selectOrgDropdown")).click();
        Assert.assertTrue(textPresent("AECC"));
        findElement(By.linkText("AECC")).click();
        findElement(By.id("searchTerms")).sendKeys("Race Category");
        Assert.assertEquals( findElement(By.id("searchTerms")).getAttribute("value"), "Race Category" );
        findElement(By.id("quickSearchReset")).click();
        Assert.assertTrue( textPresent("All Classifications") );
        Assert.assertEquals( findElement(By.id("searchTerms")).getAttribute("value"), "" );
    }
    
    @Test
    public void testSearch() {
        goHome();
        findElement(By.id("selectOrgDropdown")).click();
        Assert.assertTrue(textPresent("CCR"));
        findElement(By.linkText("CCR")).click();
        findElement(By.id("searchTerms")).sendKeys("Person Birth");
        findElement(By.id("quickSearchButton")).click();
        findElement(By.name("ftsearch"));
        Assert.assertTrue(textPresent("Qualified ("));
        Assert.assertTrue( textPresent("Person Other Premalignant Non-Melanomatous Lesion Indicator") );
    }

}
