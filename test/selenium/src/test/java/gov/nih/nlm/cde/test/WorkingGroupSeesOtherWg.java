package gov.nih.nlm.cde.test;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

import java.awt.*;
import java.io.IOException;

public class WorkingGroupSeesOtherWg extends BaseClassificationTest {

    @Test
    public void wgSeesOtherWg() throws IOException, AWTException {
        //ANONYMOUS
        mustBeLoggedOut();
        goToCdeSearch();
        textNotPresent("NINDS-WG-1");
        textNotPresent("NINDS-WG-2");

        //CTEP
        logout();
        mustBeLoggedInAs("ctepCurator", "pass");
        goToCdeSearch();
        textNotPresent("NINDS-WG-1");
        textNotPresent("NINDS-WG-2");

        //NINDS-WG-1
        logout();
        mustBeLoggedInAs("nindsWg1User", "pass");
        goToCdeSearch();
        textPresent("NINDS-WG-1");
        textPresent("NINDS-WG-2");

        //NINDS-WG-2
        logout();
        mustBeLoggedInAs("nindsWg2User", "pass");
        goToCdeSearch();
        textPresent("NINDS-WG-1");
        textPresent("NINDS-WG-2");

        //deView Wg1 sees Wg2
        logout();
        mustBeLoggedInAs("nindsWg1User", "pass");
        goToCdeByName("Urinary tract surgical procedure indicator");
        goToClassification();
        textPresent("NINDS-WG-2");
        textPresent("WG2 Classif");
        textPresent("WG2 Sub Classif");

        //deView Ctep cannot see Wg2
        logout();
        mustBeLoggedInAs("ctepCurator", "pass");
        goToCdeByName("Urinary tract surgical procedure indicator");
        goToClassification();
        textNotPresent("NINDS-WG-2");
        textNotPresent("WG2 Classif");
        textNotPresent("WG2 Sub Classif");

        //deView Anon cannot see Wg2
        logout();
        goToCdeByName("Urinary tract surgical procedure indicator");
        goToClassification();
        textNotPresent("NINDS-WG-2");
        textNotPresent("WG2 Classif");
        textNotPresent("WG2 Sub Classif");
    }
}
