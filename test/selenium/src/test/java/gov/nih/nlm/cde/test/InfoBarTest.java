package gov.nih.nlm.cde.test;

import gov.nih.nlm.cde.test.facets.FacetSearchTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class InfoBarTest extends NlmCdeBaseTest {
   
    private final FacetSearchTest facetSearchTest = new FacetSearchTest();
    
//    @Test
//    public void ownerAndAdminCanSeeLowStatus() {
//        mustBeLoggedInAs(ctepCurator_username, password);
//        String cdeName = "Low Status Cde";
//        new CdeCreateTest().createBasicCde(cdeName, "Low Stat Definition", "CTEP", "DISEASE", "Lung");
//        goToCdeSearch();
//        findElement(By.id("li-blank-Incomplete")).click();
//        hangon(2);
//        findElement(By.id("li-checked-Standard")).click();
//        hangon(2);
//        findElement(By.id("li-checked-Qualified")).click();
//        textPresent(cdeName);
//
//        mustBeLoggedInAs(cabigAdmin_username, password);
//        goToCdeSearch();
//        hangon(1);
//        if (textPresentTrueFalse("Incomplete (")) {
//            findElement(By.id("li-blank-Incomplete")).click();
//            findElement(By.id("li-checked-Qualified")).click();
//            findElement(By.id("li-checked-Standard")).click();
//            textNotPresent(cdeName);
//        }
//
//        mustBeLoggedInAs(nlm_username, nlm_password);
//        goToCdeSearch();
//        findElement(By.id("li-blank-Incomplete")).click();
//        hangon(1);
//        findElement(By.id("li-checked-Qualified")).click();
//        hangon(1);
//        findElement(By.id("li-checked-Standard")).click();
//        textPresent(cdeName);
//
//        mustBeLoggedInAs(ctepCurator_username, password);
//        goToCdeByName(cdeName, "Incomplete");
//        findElement(By.id("editStatus")).click();
//        new Select(driver.findElement(By.name("registrationStatus"))).selectByVisibleText("Candidate");
//        findElement(By.id("saveRegStatus")).click();
//        hangon(4);
//
//        goToCdeSearch();
//        findElement(By.id("li-blank-Candidate")).click();
//        hangon(2);
//        findElement(By.id("li-checked-Standard")).click();
//        hangon(2);
//        findElement(By.id("li-checked-Qualified")).click();
//        textPresent(cdeName);
//
//        mustBeLoggedInAs(cabigAdmin_username, password);
//        goToCdeSearch();
//        hangon(1);
//        if (textPresentTrueFalse("Candidate (")) {
//            findElement(By.id("li-blank-Candidate")).click();
//            textNotPresent(cdeName);
//        }
//
//        mustBeLoggedInAs(nlm_username, nlm_password);
//        goToCdeSearch();
//        findElement(By.id("ftsearch-input")).sendKeys(cdeName);
//        findElement(By.cssSelector("i.fa-search")).click();
//        hangon(1);
//        findElement(By.id("li-blank-Candidate")).click();
//        findElement(By.id("li-checked-Standard")).click();
//        findElement(By.id("li-checked-Qualified")).click();
//        textPresent(cdeName);
//    }
    
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
        textPresent("All Statuses");
        hangon(2);
        findElement(By.id("li-checked-Qualified")).click();
        textNotPresent(", Qualified");
        textPresent(", Recorded");
        findElement(By.id("li-checked-Recorded")).click();
        textPresent( "Standard, Candidate" );
        scrollToTop();
        findElement(By.id("resetSearch")).click();
        textPresent( "results for All Terms | All Classifications | All Statuses" );
    }
    
}
