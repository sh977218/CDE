package gov.nih.nlm.cde.test.bundle;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.testng.annotations.Test;

public class BundleView extends NlmCdeBaseTest {

    @Test
    public void viewFormBundle() {
        goToFormByName("Adverse Event Tracking Log");
        textPresent("This form is a bundle");

        goToFormByName("DateTypeTest");
        textNotPresent("This form is a bundle");
    }
}
