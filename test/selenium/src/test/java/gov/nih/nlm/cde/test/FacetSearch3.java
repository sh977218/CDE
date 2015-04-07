
package gov.nih.nlm.cde.test;

import static gov.nih.nlm.cde.test.NlmCdeBaseTest.acrin_username;
import org.openqa.selenium.By;
import org.openqa.selenium.TimeoutException;
import org.testng.annotations.Test;


public class FacetSearch3 extends NlmCdeBaseTest {
    
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
        try {
            textPresent("Albert Einstein Cancer Center");
        } catch (TimeoutException e) {
            hoverOverElement(findElement(By.linkText("CDEs")));
            hangon(1);
            hoverOverElement(findElement(By.id("classifications-text-AECC")));
            textPresent("Albert Einstein Cancer Center");            
        }
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
        mustBeLoggedOut();
        goToCdeSearch();
        findElement(By.id("li-blank-NINDS")).click();
        findElement(By.id("li-blank-Disease")).click();
        findElement(By.id("li-blank-Neuromuscular Disease")).click();
        textPresent( "NINDS > Disease > Neuromuscular Disease" );
        
        findElement(By.id("altClassificationFilterModeToggle")).click();
        textPresent( "and All Classifications" );
        hangon(1);
        findElement(By.id("li-blank-NINDS")).click();
        findElement(By.id("li-blank-Domain")).click();
        findElement(By.id("li-blank-Assessments and Examinations")).click();
        textPresent( "and NINDS > Domain > Assessments and Examinations" );
        textPresent( "Imaging Diagnostics (23" );
        
        findElement(By.id("li-blank-Imaging Diagnostics")).click();
        textPresent( "and NINDS > Domain > Assessments and Examinations > Imaging Diagnostics" );
        
        findElement(By.linkText("Boards")).click();
        findElement(By.linkText("CDEs")).click();
        textPresent( "and NINDS > Domain > Assessments and Examinations > Imaging Diagnostics" );
        
        findElement(By.id("removeAltClassificationFilterMode")).click();
        textNotPresent( "and NINDS > Domain > Assessments and Examinations > Imaging Diagnostics" );
        textPresent( "NINDS (100" );
        
        findElement(By.id("resetSearch")).click();
        hangon(.5);
        textPresent( "All Terms | All Classifications | Preferred Standard, Standard, Qualified" );
    }
    
}
