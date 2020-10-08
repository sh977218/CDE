package gov.nih.nlm.cde.test.classification;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class ViewOrgClassificationTest extends NlmCdeBaseTest {
    @Test
    public void viewOrgClassifications() {
        mustBeLoggedInAs(classificationMgtUser_username, password);
        gotoClassificationMgt();
        nonNativeSelect("", "Start by choosing your Organization", "PS&CC");
        textPresent("edu.fccc.brcf.domain");
        textNotPresent("Magnetic Resonance Imaging (MRI)");
        nonNativeSelect("", "Start by choosing your Organization", "ACRIN");
        textPresent("Magnetic Resonance Imaging (MRI)");
        textNotPresent("edu.fccc.brcf.domain");
    }
}
