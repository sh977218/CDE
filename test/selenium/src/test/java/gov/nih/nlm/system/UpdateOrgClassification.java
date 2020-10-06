package gov.nih.nlm.system;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class UpdateOrgClassification extends NlmCdeBaseTest {
    @Test
    public void updateOrgClassificationTest() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        gotoClassificationMgt();
        nonNativeSelect("", "Start by choosing your Organization", "TEST");
        textPresent("Denise Sentinel CSI");
        textNotPresent("AIRR demo");
        clickElement(By.id("updateOrgBtn"));
        textPresent("AIRR demo");
    }
}
