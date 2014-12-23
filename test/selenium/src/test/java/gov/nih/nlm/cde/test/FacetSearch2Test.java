package gov.nih.nlm.cde.test;

import static gov.nih.nlm.cde.test.NlmCdeBaseTest.ctepCurator_username;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.annotations.Test;

public class FacetSearch2Test extends NlmCdeBaseTest {
   
    private final FacetSearchTest facetSearchTest = new FacetSearchTest();
    
    @Test
    public void ownerAndAdminCanSeeLowStatus() {
        mustBeLoggedInAs(ctepCurator_username, password);
        String cdeName = "Low Status Cde";
        new CdeCreateTest().createBasicCde(cdeName, "Low Stat Definition", "CTEP", "DISEASE", "Lung");
        goToCdeSearch();
        findElement(By.id("li-blank-Incomplete")).click();
        hangon(2);
        findElement(By.id("li-checked-Standard")).click();
        hangon(2);
        findElement(By.id("li-checked-Qualified")).click();
        textPresent(cdeName);
        
        mustBeLoggedInAs(cabigAdmin_username, password);
        goToCdeSearch();
        hangon(1);
        if (textPresentTrueFalse("Incomplete (")) {
            findElement(By.id("li-blank-Incomplete")).click();
            findElement(By.id("li-checked-Qualified")).click();
            findElement(By.id("li-checked-Standard")).click();
            textNotPresent(cdeName);
        }
        
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToCdeSearch();
        findElement(By.id("li-blank-Incomplete")).click();
        hangon(1);
        findElement(By.id("li-checked-Qualified")).click();
        hangon(1);
        findElement(By.id("li-checked-Standard")).click();
        textPresent(cdeName);

        mustBeLoggedInAs(ctepCurator_username, password);
        goToCdeByName(cdeName, "Incomplete");
        findElement(By.id("editStatus")).click();
        modalHere();
        new Select(driver.findElement(By.name("registrationStatus"))).selectByVisibleText("Candidate");
        findElement(By.id("saveRegStatus")).click();
        hangon(4);

        goToCdeSearch();
        findElement(By.id("li-blank-Candidate")).click();
        hangon(2);
        findElement(By.id("li-checked-Standard")).click();
        hangon(2);
        findElement(By.id("li-checked-Qualified")).click();
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
        findElement(By.id("li-checked-Standard")).click();
        findElement(By.id("li-checked-Qualified")).click();
        textPresent(cdeName);        
    }
    
    @Test
    public void infoBarClassification() {
        goToCdeSearch();
        findElement(By.id("li-blank-NINDS")).click();
        findElement(By.id("li-blank-Disease")).click();
        findElement(By.id("li-blank-Amyotrophic Lateral Sclerosis")).click();
        facetSearchTest.clickIfDisplayed("li-blank-Classification");
        facetSearchTest.clickIfDisplayed("li-blank-Core");
        textPresent( "NINDS > Disease > Amyotrophic Lateral Sclerosis > Classification > Core" );
        findElement(By.id("resetSearch")).click();
        textPresent( "All Classifications" );
    }
    
    @Test
    public void infoBarStatus() {
        goToCdeSearch();
        textPresent(", Qualified");
        hangon(2);
        findElement(By.id("li-checked-Qualified")).click();
        textNotPresent(", Qualified");
        findElement(By.id("li-blank-Recorded")).click();
        textPresent( "Standard, Recorded" );
        scrollToTop();
        findElement(By.id("resetSearch")).click();
        textPresent( "results for All Terms | All Classifications | Preferred Standard, Standard, Qualified" );
    }
    
        
    @Test
    public void infoBarTerms() {
        goToCdeSearch();
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
    
    @Test
    public void twoClassificationSearch() {
        logout();
        goToCdeSearch();
        findElement(By.id("li-blank-NINDS")).click();
        findElement(By.id("li-blank-Disease")).click();
        findElement(By.id("li-blank-Neuromuscular Disease")).click();
        textPresent( "NINDS > Disease > Neuromuscular Disease" );
        
        findElement(By.id("altClassificationFilterModeToggle")).click();
        textPresent( "and All Classifications" );
        findElement(By.id("li-blank-NINDS")).click();
        findElement(By.id("li-blank-Domain")).click();
        findElement(By.id("li-blank-Assessments and Examinations")).click();
        textPresent( "and NINDS > Domain > Assessments and Examinations" );
        textPresent( "Imaging Diagnostics (236)" );
        
        findElement(By.id("li-blank-Imaging Diagnostics")).click();
        textPresent( "and NINDS > Domain > Assessments and Examinations > Imaging Diagnostics" );
        
        findElement(By.id("removeAltClassificationFilterMode")).click();
        textNotPresent( "and NINDS > Domain > Assessments and Examinations > Imaging Diagnostics" );
        textPresent( "NINDS (1005)" );
        
        findElement(By.id("resetSearch")).click();
        hangon(.5);
        textPresent( "All Terms | All Classifications | Preferred Standard, Standard, Qualified" );
    }
}
