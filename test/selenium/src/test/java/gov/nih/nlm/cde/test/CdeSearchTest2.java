package gov.nih.nlm.cde.test;

import static gov.nih.nlm.cde.test.NlmCdeBaseTest.driver;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;


public class CdeSearchTest2 extends NlmCdeBaseTest {
     @Test 
    public void searchHighlightDefinition() {
        goToCdeSearch();
        findElement(By.name("ftsearch")).sendKeys("\"graded scale\"");
        findElement(By.id("search.submit")).click();    
        Assert.assertTrue(textPresent("for \"graded scale\" |"));
        Assert.assertTrue(driver.findElements(By.xpath("//span[text()=\"Definition\"]")).size() > 5); 
    }
    
    @Test 
    public void searchHighlightPv() {
        goToCdeSearch();
        findElement(By.name("ftsearch")).sendKeys("myopathic");
        findElement(By.id("search.submit")).click();    
        Assert.assertTrue(textPresent("for myopathic |"));
        Assert.assertEquals(driver.findElements(By.xpath("//span[text()=\"Permissible Values\"]")).size(), 2);
    }
   
    @Test 
    public void searchHighlightClassif() {
        goToCdeSearch();
        findElement(By.name("ftsearch")).sendKeys("finasteride");
        findElement(By.id("search.submit")).click();    
        Assert.assertTrue(textPresent("for finasteride |"));
        Assert.assertEquals(driver.findElements(By.xpath("//span[text()=\"Classification\"]")).size(), 6);
    }
    
    @Test
    public void sdcView() {
        String cdeName = "Anal Endoscopy Diagnostic Procedure Performed Other Specify Text";
        openCdeInList(cdeName);
        findElement(By.linkText("SDC View")).click();
        textPresent(cdeName);
        Assert.assertTrue(findElement(By.id("dd_scopedId")).getText().trim().startsWith("cde.nlm.nih.gov/"));
        Assert.assertEquals("1", findElement(By.id("dd_version")).getText());
        Assert.assertEquals("Anal Endoscopy Diagnostic Procedure Performed Other Specify Text", findElement(By.id("dd_name")).getText());
        Assert.assertEquals("Specify", findElement(By.id("dd_prefQ")).getText());
        Assert.assertEquals("N/A", findElement(By.id("dd_altQ")).getText());
        Assert.assertEquals("The free text field used to describe the results of the anascopy.", findElement(By.id("dd_def")).getText());
        Assert.assertEquals("Anal Endoscopy Diagnostic Procedure Performed", findElement(By.id("dd_dec")).getText());
        Assert.assertEquals("DCP", findElement(By.id("dd_ctx")).getText());
        Assert.assertEquals("DCP", findElement(By.id("dd_ctxName")).getText());
        Assert.assertEquals("N/A", findElement(By.id("dd_adminStatus")).getText());
        Assert.assertEquals("Qualified", findElement(By.id("dd_regStatus")).getText());
        Assert.assertEquals("N/A", findElement(By.id("dd_updated")).getText());
        Assert.assertEquals("N/A", findElement(By.id("dd_subOrg")).getText());
        Assert.assertEquals("N/A", findElement(By.id("dd_subOrgName")).getText());
        Assert.assertEquals("DCP", findElement(By.id("dd_stewOrg")).getText());
        Assert.assertEquals("DCP", findElement(By.id("dd_stewOrgName")).getText());
        Assert.assertEquals("DCP:Division of Cancer Prevention", findElement(By.id("dd_origin")).getText());
        Assert.assertEquals("Other Specify Text", findElement(By.id("dd_vd")).getText());
        Assert.assertEquals("CHARACTER", findElement(By.id("dd_datatype")).getText());
        Assert.assertEquals("enumerated", findElement(By.id("dd_type")).getText());
    }
    
    @Test
    public void StandardStatusWarningCheck() {
        // Check that a none Standard or Preferred Standard CDE doesn't have warning message when not logged in
        goToCdeByName("Specimen Collection Sampling Number");
        textNotPresent("Note: You may not edit this CDE because it is standard.");

        // Check that a Standard CDE doesn't have warning message when viewed by none owner
        goToCdeByName("Adverse Event Ongoing Event Indicator");
        textNotPresent("Note: You may not edit this CDE because it is standard.");
        
        // Check that a Standard CDE doesn't have warning message when viewed by site admin
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToCdeByName("Adverse Event Ongoing Event Indicator");
        textNotPresent("Note: You may not edit this CDE because it is standard.");
        
        // Check that a Standard CDE have warning message
        mustBeLoggedInAs(ctepCurator_username, password);
        goToCdeByName("Person Birth Date");
        textPresent("Note: You may not edit this CDE because it is standard.");
    }
    
    @Test
    public void saveSearchState() {
        goToCdeSearch();
        findElement(By.xpath("//i[@id=\"li-blank-CTEP\"]")).click();
        findElement(By.xpath("//i[@id=\"li-blank-CATEGORY\"]")).click();
        hangon(1);
        textPresent("results for All Terms | CTEP > CATEGORY | Preferred Standard, Standard, Qualified");
        findElement(By.xpath("//i[@id=\"li-checked-Qualified\"]")).click();
        scrollToTop();
        textPresent("results for All Terms | CTEP > CATEGORY | Preferred Standard, Standard");
        findElement(By.name("ftsearch")).sendKeys("name");
        findElement(By.id("search.submit")).click();     
        textPresent("0 results for name | CTEP > CATEGORY | Preferred Standard, Standard");
        findElement(By.linkText("Forms")).click();     
        textNotPresent("CATEGORY");
        findElement(By.linkText("CDEs")).click();     
        textPresent("0 results for name | CTEP > CATEGORY | Preferred Standard, Standard");
    }
      
}
