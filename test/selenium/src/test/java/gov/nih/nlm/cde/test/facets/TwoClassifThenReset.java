package gov.nih.nlm.cde.test.facets;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class TwoClassifThenReset extends NlmCdeBaseTest {

    @Test
    public void twoClassifsThenReset() {
        goToCdeSearch();
        clickElement(By.id("browseOrg-CTEP"));
        findElement(By.id("li-blank-CATEGORY")).click();
        textPresent("AdEERS");
        clickElement(By.id("altClassificationFilterModeToggle"));
        textPresent("SPOREs");
        clickElement(By.id("li-blank-CTEP"));
        findElement(By.id("li-blank-DISEASE")).click();
        textPresent("Bladder");
        clickElement(By.id("menu_cdes_link"));
        clickElement(By.id("browseOrg-CCR"));
        textPresent("C3D Domain (");
        textNotPresent("SPOREs", By.id("classificationListHolder"));
    }

}
