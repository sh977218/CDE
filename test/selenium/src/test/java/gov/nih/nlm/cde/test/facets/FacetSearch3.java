
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

}
