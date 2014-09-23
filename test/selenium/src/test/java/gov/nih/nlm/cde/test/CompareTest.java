package gov.nih.nlm.cde.test;

import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.Assert;
import org.testng.annotations.Test;

public class CompareTest extends NlmCdeBaseTest{
    
    @Test
    public void noElementCompareList() {
        goToCdeSearch();
        findElement(By.linkText("Quick Board ( empty )")).click();
        Assert.assertTrue(textPresent("The quick board is empty."));
    }
    
    @Test
    public void emptyList() {
        goToCdeSearch();
        shortWait.until(ExpectedConditions.invisibilityOfElementLocated(By.id("emptyCart")));
        openCdeInList("Prognostic");
        findElement(By.id("compare_0")).click();
        Assert.assertTrue(textPresent("Quick Board ( 1 )"));      
    }
    
    @Test
    public void Compare2Elements() {
        goToCdeSearch();
        addToCompare("Person Gender Text Type", "Patient Gender Category");
        shortWait.until(ExpectedConditions.visibilityOfElementLocated(By.id("pv-0-valid")));
        shortWait.until(ExpectedConditions.visibilityOfElementLocated(By.id("pv-3-warning")));
        textNotPresent("VSAC Value Set");
    }
    
    @Test
    public void compareMeWithMlt() {
        goToCdeByName("Common Toxicity Criteria Adverse Event Iron Excess Grade");
        findElement(By.linkText("More Like This")).click();
        findElement(By.id("compareMe")).click();
        shortWait.until(ExpectedConditions.invisibilityOfElementLocated(By.id("compareMe")));
        findElement(By.linkText("Common Toxicity Criteria Adverse Event Platelet Count Grade")).click();
        hangon(.5);
        shortWait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//div/div/h4/a/span[text()='Common Toxicity Criteria Adverse Event Platelet Count Grade']/../../../..//a[@title='Add to Quick Board']")));
        findElement(By.xpath("//div/div/h4/a/span[text()='Common Toxicity Criteria Adverse Event Platelet Count Grade']/../../../..//a[@title='Add to Quick Board']")).click();
        shortWait.until(ExpectedConditions.invisibilityOfElementLocated(By.xpath("//div/div/h4/a/span[text()='Common Toxicity Criteria Adverse Event Platelet Count Grade']/../../../..//a[@title='Add to Quick Board']")));
        findElement(By.linkText("Quick Board ( 2 )")).click();
        findElement(By.id("qb.compare")).click();
        Assert.assertTrue(textPresent("in CTC category Blood/Bone Marrow"));
        Assert.assertTrue(textPresent("CTC Adverse Event Platelets Grade"));
    }
    
    @Test
    public void cantEditInCompare() {
        mustBeLoggedInAs(ctepCurator_username, ctepCurator_password);
        addToCompare("Person Birth Date", "Patient Ethnic Group Category");
        shortWait.until(ExpectedConditions.invisibilityOfElementLocated(By.id("editStatus")));
        shortWait.until(ExpectedConditions.invisibilityOfElementLocated(By.id("addNamePair")));
        shortWait.until(ExpectedConditions.invisibilityOfElementLocated(By.xpath("//a[@title='Remove']")));
        shortWait.until(ExpectedConditions.invisibilityOfElementLocated(By.cssSelector("fa-edit")));
        
    }
    
}
