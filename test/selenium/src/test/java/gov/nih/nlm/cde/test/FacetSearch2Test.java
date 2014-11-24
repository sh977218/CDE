package gov.nih.nlm.cde.test;

import static gov.nih.nlm.cde.test.NlmCdeBaseTest.ctepCurator_username;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.annotations.Test;

public class FacetSearch2Test extends NlmCdeBaseTest {
   
    private FacetSearchTest facetSearchTest = new FacetSearchTest();
    
    @Test
    public void ownerAndAdminCanSeeLowStatus() {
        mustBeLoggedInAs(ctepCurator_username, password);
        String cdeName = "Low Status Cde";
        new CdeCreateTest().createBasicCde(cdeName, "Low Stat Definition", "0.1", "CTEP", "DISEASE", "Lung");
        goToCdeSearch();
        findElement(By.id("li-blank-Incomplete")).click();
        textPresent(cdeName);
        
        mustBeLoggedInAs(cabigAdmin_username, password);
        goToCdeSearch();
        hangon(1);
        if (textPresentTrueFalse("Incomplete (")) {
            findElement(By.id("li-blank-Incomplete")).click();
            textNotPresent(cdeName);
        }
        
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToCdeSearch();
        findElement(By.id("li-blank-Incomplete")).click();
        textPresent(cdeName);

        mustBeLoggedInAs(ctepCurator_username, password);
        goToCdeByName(cdeName);
        findElement(By.id("editStatus")).click();
        modalHere();
        new Select(driver.findElement(By.name("registrationStatus"))).selectByVisibleText("Candidate");
        findElement(By.id("saveRegStatus")).click();
        hangon(4);

        goToCdeSearch();
        findElement(By.id("li-blank-Candidate")).click();
        textPresent(cdeName);
        
        mustBeLoggedInAs(cabigAdmin_username, password);
        goToCdeSearch();
        hangon(1);
        if (textPresentTrueFalse("Candidate (")) {
            findElement(By.id("li-blank-Candidate")).click();
            textNotPresent(cdeName);
        }
        
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToCdeSearch();
        findElement(By.id("ftsearch-input")).sendKeys(cdeName);
        findElement(By.cssSelector("i.fa-search")).click();
        hangon(1);
        findElement(By.id("li-blank-Candidate")).click();
        textPresent(cdeName);
        
    }
    
    @Test
    public void infoBarClassification() {
        goToCdeSearch();
        findElement(By.id("resetSearch")).click();
        hangon(.5);
        findElement(By.id("li-blank-NINDS")).click();
        findElement(By.id("li-blank-Disease")).click();
        findElement(By.id("li-blank-Amyotrophic Lateral Sclerosis")).click();
        facetSearchTest.clickIfDisplayed("li-blank-Classification");
        facetSearchTest.clickIfDisplayed("li-blank-Core");
        textPresent( "NINDS : Disease : Amyotrophic Lateral Sclerosis : Classification : Core" );
        findElement(By.id("resetSearch")).click();
        textPresent( "All Classifications" );
    }
    
    @Test
    public void infoBarStatus() {
        goToCdeSearch();
        findElement(By.id("resetSearch")).click();
        hangon(2);
        findElement(By.id("li-blank-Qualified")).click();
        textPresent("| Qualified");
        findElement(By.id("li-blank-Recorded")).click();
        textPresent( "Qualified, Recorded" );
        scrollToTop();
        findElement(By.id("resetSearch")).click();
        textPresent( "All Status" );
    }
    
        
    @Test
    public void infoBarTerms() {
        goToCdeSearch();
        findElement(By.id("resetSearch")).click();
        findElement(By.name("ftsearch")).sendKeys("blah blah blah");
        findElement(By.cssSelector("i.fa-search")).click();
        hangon(.5);
        scrollToTop();
        textPresent( "blah blah blah" );
        findElement(By.id("resetSearch")).click();
        textPresent( "All Terms" );
    }
    
    @Test
    public void hoverOverClassifications() {
        goToCdeSearch();
        hoverOverElement(findElement(By.linkText("CDEs")));
        textNotPresent("Albert Einstein Cancer Center");
        hoverOverElement(findElement(By.id("classifications-text-AECC")));
        textPresent("Albert Einstein Cancer Center");
        hoverOverElement(findElement(By.id("classifications-text-caBIG")));
        textNotPresent("Albert Einstein Cancer Center");
    }
    
    @Test
    public void lowStatusFilter() {
        mustBeLoggedInAs(acrin_username, password);
        goToCdeSearch();
        textPresent("ACRIN (3)");
        logout();
        goToCdeSearch();
        textNotPresent("ACRIN (3");
    }    
    
}
