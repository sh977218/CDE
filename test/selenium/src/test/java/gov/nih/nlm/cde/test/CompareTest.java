package gov.nih.nlm.cde.test;

import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.Assert;
import org.testng.annotations.Test;

public class CompareTest extends NlmCdeBaseTest{
    
    @Test
    public void noElementCompareList() {
        goToSearch();
        findElement(By.linkText("Quick Board ( empty )")).click();
        Assert.assertTrue(textPresent("The quick board is empty."));
    }
    
    @Test
    public void emptyList() {
        goToSearch();
        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.id("emptyCart")));
        openCdeInList("Prognostic");
        findElement(By.id("compare_0")).click();
        Assert.assertTrue(textPresent("Quick Board ( 1 )"));      
    }
    
  
    
    @Test
    public void Compare2Elements() {
        goToSearch();
        addToCompare("Person Gender Text Type", "Patient Gender Category");        
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("pv-0-valid")));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("pv-3-warning")));
        Assert.assertTrue(textNotPresent("VSAC Value Set"));
    }
    
    @Test
    public void compareMeWithMlt() {
        goToCdeByName("Common Toxicity Criteria Adverse Event Iron Excess Grade");
        findElement(By.linkText("More Like This")).click();
        findElement(By.id("compareMe")).click();
        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.id("compareMe")));
        findElement(By.linkText("Common Toxicity Criteria Adverse Event Platelet Count Grade")).click();
        hangon(.5);
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("compare_0")));
        findElement(By.id("compare_0")).click();
        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.id("compare_0")));
        findElement(By.linkText("Quick Board ( 2 )")).click();
        findElement(By.id("qb.compare")).click();
        Assert.assertTrue(textPresent("in CTC category Blood/Bone Marrow"));
        Assert.assertTrue(textPresent("CTC Adverse Event Platelets Grade"));
    }
    
    @Test
    public void cantEditInCompare() {
        mustBeLoggedInAs(ctepCurator_username, ctepCurator_password);
        addToCompare("Person Birth Date", "Patient Ethnic Group Category");
        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.id("editStatus")));
        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.id("addNamePair")));
        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.xpath("//a[@title='Remove']")));
        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.cssSelector("fa-edit")));
        
    }
    
}
