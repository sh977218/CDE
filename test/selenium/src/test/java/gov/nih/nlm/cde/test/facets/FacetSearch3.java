
package gov.nih.nlm.cde.test.facets;

import gov.nih.nlm.system.NlmCdeBaseTest;
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
        textPresent("blah blah blah");
        findElement(By.id("menu_cdes_link")).click();
        findElement(By.id("browseOrg-NINDS")).click();
        textPresent("All Terms");
    }
    
    @Test
    public void hoverOverClassifications() {
        goToCdeSearch();
        textPresent("Albert Einstein Cancer Center");
        findElement(By.id("browseOrg-AECC")).click();
        hoverOverElement(findElement(By.linkText("CDEs")));
        textNotPresent("Albert Einstein Cancer Center");
        hoverOverElement(findElement(By.id("classifications-text-AECC")));
        try {
            textPresent("Albert Einstein Cancer Center");
        } catch (TimeoutException e) {
            hoverOverElement(findElement(By.linkText("CDEs")));
            hangon(1);
            hoverOverElement(findElement(By.id("classifications-text-AECC")));
            checkTooltipText(By.id("classifications-text-AECC"), "Albert Einstein Cancer Center");
        }
        hoverOverElement(findElement(By.linkText("CDEs")));
        textNotPresent("Albert Einstein Cancer Center");
    }
    
    @Test
    public void twoClassificationSearch() {
        mustBeLoggedOut();
        goToCdeSearch();
        findElement(By.id("browseOrg-NINDS")).click();
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
        driver.navigate().back();
        textPresent( "and NINDS > Domain > Assessments and Examinations > Imaging Diagnostics" );
        
        findElement(By.id("removeAltClassificationFilterMode")).click();
        textNotPresent( "and NINDS > Domain > Assessments and Examinations > Imaging Diagnostics" );
        textPresent( "NINDS (100" );

        hangon(1);

        findElement(By.id("menu_cdes_link")).click();
        findElement(By.id("browseOrg-caCORE"));
        findElement(By.id("browseOrg-NINDS")).click();
        textPresent( "All Terms | NINDS | All Statuses" );
    }
    
}
