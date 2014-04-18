package gov.nih.nlm.cde.test;

import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.Assert;
import org.testng.annotations.Test;

public class CompareTest extends NlmCdeBaseTest{
    
    @Test
    public void noElementCompareList() {
        goHome();
        findElement(By.linkText("Compare ( empty )")).click();
        Assert.assertTrue(textPresent("Search for data elements and hit the compare button"));
    }
    
    @Test
    public void emptyList() {
        goHome();
        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.id("emptyCart")));
        openCdeInList("Sleep");
        findElement(By.id("compare_0")).click();
        Assert.assertTrue(textPresent("Compare ( 1 )"));
        findElement(By.id("emptyCart")).click();
        Assert.assertTrue(textPresent("Compare ( empty )"));        
    }
    
    @Test
    public void Compare2Elements() {
        goHome();
        Assert.assertTrue(textPresent("Compare ( empty )"));
        findElement(By.name("ftsearch")).sendKeys("Male Female");
        findElement(By.id("search.submit")).click();
        findElement(By.linkText("Person Gender Text Type")).click();
        hangon(.5);
        findElement(By.id("compare_0")).click();
        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.id("compare_0")));
        Assert.assertTrue(textPresent("Compare ( 1 )"));
        findElement(By.id("acc_link_1")).click();
        hangon(.5);
        findElement(By.id("compare_1")).click();
        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.id("compare_1")));
        Assert.assertTrue(textPresent("Compare ( full )"));
        findElement(By.id("acc_link_2")).click();
        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.id("compare_2")));
        findElement(By.linkText("Compare ( full )")).click();
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("pv-0-valid")));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("pv-3-warning")));    
    }
    
    @Test
    public void compareMeWithMlt() {
        goToCdeByName("Common Toxicity Criteria Adverse Event Iron Excess Grade");
        findElement(By.linkText("More Like This")).click();
        findElement(By.id("compareMe")).click();
        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.id("compareMe")));
        findElement(By.linkText("Common Toxicity Criteria Adverse Event Prolonged Chest Tube Grade")).click();
        hangon(.5);
        findElement(By.id("compare_0")).click();
        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.id("compare_0")));
        findElement(By.linkText("Compare ( full )")).click();
        Assert.assertTrue(textPresent("in CTC category Blood/Bone Marrow"));
        Assert.assertTrue(textPresent("in CTC category Pulmonary/Upper Respiratory"));
    }
    
}
