package gov.nih.nlm.cde.test.tour;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class TourFromMenu extends NlmCdeBaseTest {

    @Test
    public void tourFromMenu () {
        goHome();
        goToHelp();
        clickElement(By.id("takeATourLink"));
        textPresent("This tour will guide you through");
    }

}
