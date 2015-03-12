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
        openCdeInList("Sedation status");
        findElement(By.id("compare_0")).click();
        textPresent("Quick Board ( 1 )");      
    }
    
    @Test
    public void compare2Elements() {
        goToCdeSearch();
        addToCompare("Person Gender Text Type", "Patient Gender Category");
        shortWait.until(ExpectedConditions.visibilityOfElementLocated(By.id("pv-0-valid")));
        shortWait.until(ExpectedConditions.visibilityOfElementLocated(By.id("pv-3-warning")));
        textNotPresent("VSAC Value Set");
    }
    
    @Test
    public void compare3Then2Elements() {
        resizeWindow(1524, 1150);

        String cde1 = "Assessment of Motor and Process Skills Assessment Complete Indicator";
        String cde2 = "EuroQOL Complete Indicator";
        String cde3 = "Administration Route of Administration java.lang.String";
        
        goToCdeSearch();
        addToQuickBoard(cde1);
        addToQuickBoard(cde2);
        addToQuickBoard(cde3);
        findElement(By.linkText("Quick Board ( 3 )")).click();
        textPresent(cde1);
        textPresent(cde2);
        textPresent(cde3);
        findElement(By.id("qb.compare")).click();
        textPresent("You may only compare 2 CDEs side by side.");
        closeAlert();
        findElement(By.id("remove_2")).click();
        
        findElement(By.id("qb.compare")).click();
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("pv-0-warning")));
        shortWait.until(ExpectedConditions.visibilityOfElementLocated(By.id("pv-3-valid")));
        shortWait.until(ExpectedConditions.visibilityOfElementLocated(By.id("pv-6-valid")));
        textPresent("an observational assessment that is used to measure");        
        textPresent("pain/discomfort, and anxiety/depression");        
    }
    
    @Test
    public void compareMeWithMlt() {
        goToCdeByName("Common Toxicity Criteria Adverse Event Iron Excess Grade");
        findElement(By.linkText("More Like This")).click();
        findElement(By.id("compareMe")).click();
        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.id("compareMe")));
        findElement(By.linkText("Common Toxicity Criteria Adverse Event Platelet Count Grade")).click();
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//div/div/h4/a/span[text()='Common Toxicity Criteria Adverse Event Platelet Count Grade']/../../../..//i[@title='Add to Quick Board']")));
        findElement(By.xpath("//div/div/h4/a/span[text()='Common Toxicity Criteria Adverse Event Platelet Count Grade']/../../../..//i[@title='Add to Quick Board']")).click();
        shortWait.until(ExpectedConditions.invisibilityOfElementLocated(By.xpath("//div/div/h4/a/span[text()='Common Toxicity Criteria Adverse Event Platelet Count Grade']/../../../..//i[@title='Add to Quick Board']")));
        findElement(By.linkText("Quick Board ( 2 )")).click();
        wait.until(ExpectedConditions.elementToBeClickable(By.id("qb.compare")));
        // IDK why sometimes the following click doesn't seem to work. Wait above should be enough, but no.
        hangon(1);
        clickElement(By.id("qb.compare"));
        textPresent("in CTC category Blood/Bone Marrow");
        textPresent("CTC Adverse Event Platelets Grade");
    }
    
    @Test
    public void cantEditInCompare() {
        mustBeLoggedInAs(ctepCurator_username, password);
        addToCompare("Person Birth Date", "Patient Ethnic Group Category");
        shortWait.until(ExpectedConditions.invisibilityOfElementLocated(By.id("editStatus")));
        shortWait.until(ExpectedConditions.invisibilityOfElementLocated(By.id("addNamePair")));
        shortWait.until(ExpectedConditions.invisibilityOfElementLocated(By.xpath("//a[@title='Remove']")));
        shortWait.until(ExpectedConditions.invisibilityOfElementLocated(By.cssSelector("fa-edit")));
        
    }
    
}
