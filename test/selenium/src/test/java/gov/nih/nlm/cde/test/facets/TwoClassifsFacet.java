package gov.nih.nlm.cde.test.facets;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class TwoClassifsFacet extends NlmCdeBaseTest {

    @Test
    public void twoOrgsNoClassif() {
        goToCdeSearch();
        scrollToViewById("browseOrg-TEST");
        findElement(By.id("browseOrg-TEST")).click();
        findElement(By.id("altClassificationFilterModeToggle")).click();
        textPresent("CIP (1)");
        textPresent("NHLBI (");
        findElement(By.id("li-blank-CIP")).click();
        textNotPresent("Person Birth Date");
        textPresent("1 results for");
    }

}
