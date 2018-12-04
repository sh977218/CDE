package gov.nih.nlm.cde.test.search;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class CdeSearchExcludeTest extends NlmCdeBaseTest {

    @Test
    public void searchOneExclude() {
        goToCdeSearch();
        clickElement(By.id("browseOrg-TEST"));
        textPresent("caBIG");
        clickElement(By.id("excludeFilterModeToggle"));
        clickElement(By.id("classif-caBIG"));
        textNotPresent("caBIG");
    }

    @Test
    public void searchTwoExclude() {
        goToCdeSearch();
        clickElement(By.id("browseOrg-TEST"));
        textPresent("caBIG");
        clickElement(By.id("excludeFilterModeToggle"));
        clickElement(By.id("classif-caBIG"));
        textNotPresent("caBIG");
        clickElement(By.id("classif-ONC"));
        textNotPresent("ONC");
    }

    @Test
    public void searchAllExclude() {
        goToCdeSearch();
        clickElement(By.id("browseOrg-TEST"));
        textPresent("caBIG");
        textPresent("ONC");
        textPresent("ECOG-ACRIN");
        textPresent("NHC-NCI");
        clickElement(By.id("excludeFilterModeToggle"));
        clickElement(By.id("exludeAllOrgs"));
        textNotPresent("caBIG");
        textNotPresent("ONC");
        textNotPresent("ECOG-ACRIN");
        textNotPresent("NHC-NCI");
    }
    
}