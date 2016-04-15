package gov.nih.nlm.cde.test;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class WorkingGroupTest2 extends BaseClassificationTest {

    @Test
    public void wgSeesOtherWg() {
        //ANONYMOUS
        mustBeLoggedOut();
        goToCdeSearch();
        textNotPresent("NINDS-WG-1");
        textNotPresent("NINDS-WG-2");

        //CTEP
        mustBeLoggedInAs("ctepCurator", "pass");
        goToCdeSearch();
        textNotPresent("NINDS-WG-1");
        textNotPresent("NINDS-WG-2");

        //NINDS-WG-1
        mustBeLoggedInAs("nindsWg1User", "pass");
        goToCdeSearch();
        scrollToViewById("browseOrg-NINDS-WG-1");
        textPresent("NINDS-WG-1");
        scrollToViewById("browseOrg-NINDS-WG-2");
        textPresent("NINDS-WG-2");

        //NINDS-WG-2
        mustBeLoggedInAs("nindsWg2User", "pass");
        goToCdeSearch();
        textPresent("NINDS-WG-1");
        textPresent("NINDS-WG-2");

        //DeView Wg1 sees Wg2
        mustBeLoggedInAs("nindsWg1User", "pass");
        goToCdeByName("Urinary tract surgical procedure indicator");
        findElement(By.linkText("Classification")).click();
        textPresent("NINDS-WG-2");
        textPresent("WG2 Classif");
        textPresent("WG2 Sub Classif");

        //DeView Ctep cannot see Wg2
        mustBeLoggedInAs("ctepCurator", "pass");
        goToCdeByName("Urinary tract surgical procedure indicator");
        findElement(By.linkText("Classification")).click();
        textNotPresent("NINDS-WG-2");
        textNotPresent("WG2 Classif");
        textNotPresent("WG2 Sub Classif");

        //DeView Anon cannot see Wg2
        logout();
        goToCdeByName("Urinary tract surgical procedure indicator");
        findElement(By.linkText("Classification")).click();
        textNotPresent("NINDS-WG-2");
        textNotPresent("WG2 Classif");
        textNotPresent("WG2 Sub Classif");

    }
}
