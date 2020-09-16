package gov.nih.nlm.cde.test.classification;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class ViewOrgClassificationTest extends NlmCdeBaseTest {
    @Test
    public void viewOrgClassifications() {
        mustBeLoggedInAs(classificationMgtUser_username, password);
        clickElement(By.id("username_link"));
        clickElement(By.id("user_classifications"));
        clickElement(By.cssSelector("mat-select"));
        selectMatSelectDropdownByText("PS&CC");
        textPresent("edu.fccc.brcf.domain");
        textNotPresent("Magnetic Resonance Imaging (MRI)");
        clickElement(By.cssSelector("mat-select"));
        selectMatSelectDropdownByText("ACRIN");
        textPresent("Magnetic Resonance Imaging (MRI)");
        textNotPresent("edu.fccc.brcf.domain");
    }
}
