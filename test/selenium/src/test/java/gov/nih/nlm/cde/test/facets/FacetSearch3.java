
package gov.nih.nlm.cde.test.facets;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.TimeoutException;
import org.testng.annotations.Test;


public class FacetSearch3 extends NlmCdeBaseTest {

    @Test
    public void infoBarTerms() {
        goToCdeSearch();
        findElement(By.name("q")).sendKeys("blah blah blah");
        clickElement(By.id("search.submit"));
        hangon(.5);
        scrollToTop();
        textPresent("blah blah blah");
        clickElement(By.id("menu_cdes_link"));
        clickElement(By.id("browseOrg-NINDS"));
        textPresent("All Terms");
    }

    @Test
    public void hoverOverClassifications() {
        goToCdeSearch();
        textPresent("Albert Einstein Cancer Center");
        clickElement(By.id("browseOrg-AECC"));
        hoverOverElement(findElement(By.linkText("CDES")));
        textNotPresent("Albert Einstein Cancer Center");
        hoverOverElement(findElement(By.xpath("//*[@id='classif-AECC' and contains(@class,'treeItemText')]")));
        try {
            textPresent("Albert Einstein Cancer Center");
        } catch (TimeoutException e) {
            hoverOverElement(findElement(By.linkText("CDES")));
            hangon(1);
            hoverOverElement(findElement(By.xpath("//*[@id='classif-AECC' and contains(@class,'treeItemText')]")));
            textPresent("Albert Einstein Cancer Center");
        }
        hoverOverElement(findElement(By.linkText("CDES")));
        textNotPresent("Albert Einstein Cancer Center");
    }

    @Test
    public void twoClassificationSearch() {
        mustBeLoggedOut();
        goToCdeSearch();
        clickElement(By.id("browseOrg-NINDS"));
        clickElement(By.id("classif-Disease"));
        clickElement(By.id("classif-Neuromuscular Disease"));
        textPresent("NINDS > Disease > Neuromuscular Disease");

        clickElement(By.id("altClassificationFilterModeToggle"));
        textPresent("and", By.id("classifAlt_filter"));
        hangon(1);
        clickElement(By.id("classif-NINDS"));
        clickElement(By.id("classif-Domain"));
        clickElement(By.id("classif-Assessments and Examinations"));
        textPresent("NINDS > Domain > Assessments and Examinations", By.id("classifAlt_filter"));
        textPresent("Imaging Diagnostics (30");

        clickElement(By.id("classif-Imaging Diagnostics"));
        textPresent("NINDS > Domain > Assessments and Examinations > Imaging Diagnostics", By.id("classifAlt_filter"));

        clickElement(By.id("boardsMenu"));
        hangon(1);
        driver.navigate().back();
        textPresent("NINDS > Domain > Assessments and Examinations > Imaging Diagnostics", By.id("classifAlt_filter"));

        clickElement(By.id("removeAltClassificationFilterMode"));
        textNotPresent("NINDS > Domain > Assessments and Examinations > Imaging Diagnostics", By.id("classifAlt_filter"));
        textPresent("Classification (100");

        clickElement(By.id("menu_cdes_link"));
        findElement(By.id("browseOrg-caCORE"));
        clickElement(By.id("browseOrg-NINDS"));
        checkSearchResultInfo("All Terms", "NINDS", null, "All Topics", "All Statuses", null);
    }

}
