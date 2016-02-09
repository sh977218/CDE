package gov.nih.nlm.cde.test.facets;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class TwoClassifThenReset extends NlmCdeBaseTest {

    @Test
    public void twoClassifsThenReset() {
        goToCdeSearch();
        clickElement(By.id("browseOrg-NINDS"));
        findElement(By.id("li-blank-Disease")).click();
        textPresent("Amyotrophic");
        findElement(By.id("altClassificationFilterModeToggle")).click();
        textPresent("CP-WG");
        clickElement(By.id("li-blank-NINDS"));
        findElement(By.id("li-blank-Domain")).click();
        textPresent("Additional Instruments");
        clickElement(By.id("menu_cdes_link"));
        clickElement(By.id("browseOrg-CCR"));
        textPresent("C3D Domain (");
        textNotPresent("NINDS");
    }

}
