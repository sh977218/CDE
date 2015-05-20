package gov.nih.nlm.cde.test;

import gov.nih.nlm.cde.test.facets.FacetSearchTest;
import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class InfoBarTest extends NlmCdeBaseTest {
   
    private final FacetSearchTest facetSearchTest = new FacetSearchTest();

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
        setLowStatusesVisible();
        textPresent("| All Statuses");
        findElement(By.id("li-blank-Preferred Standard")).click();
        hangon(1);
        findElement(By.id("li-blank-Standard")).click();
        hangon(1);
        findElement(By.id("li-blank-Qualified")).click();
        textPresent("| Preferred Standard, Standard, Qualified");
        hangon(1);
        findElement(By.id("li-checked-Qualified")).click();
        textNotPresent(", Qualified");
        textPresent(", Standard");
        findElement(By.id("li-blank-Recorded")).click();
        textPresent( "Standard, Recorded" );
        scrollToTop();
        findElement(By.id("resetSearch")).click();
        textPresent( "results for All Terms | All Classifications | All Statuses" );
    }
    
}
