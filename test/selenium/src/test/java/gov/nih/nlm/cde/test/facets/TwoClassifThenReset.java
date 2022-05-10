package gov.nih.nlm.cde.test.facets;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class TwoClassifThenReset extends NlmCdeBaseTest {

    @Test
    public void twoClassifsThenReset() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToCdeSearch();
        clickElement(By.id("browseOrg-CTEP"));
        clickElement(By.id("classif-CATEGORY"));
        textPresent("AdEERS");
        clickElement(By.id("altClassificationFilterModeToggle"));
        textPresent("SPOREs");
        clickElement(By.id("classif-CTEP"));
        clickElement(By.id("classif-DISEASE"));
        textPresent("Bladder");
        scrollToTop();
        clickElement(By.id("menu_cdes_link"));
        clickElement(By.id("browseOrg-CCR"));
        textPresent("C3D Domain (");
        textNotPresent("SPOREs", By.id("classificationListHolder"));
    }

}
