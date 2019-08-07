package gov.nih.nlm.system;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class UpdateOrgClassification extends NlmCdeBaseTest {
    @Test
    public void updateOrgClassificationTest() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        gotoClassificationMgt();
        clickElement(By.id("orgToManage"));
        selectMatSelectDropdownByText("TEST");
        textPresent("Denise Sentinel CSI");
        textNotPresent("AIRR demo");
        clickElement(By.id("updateOrgBtn"));
        textPresent("AIRR demo");
    }
}
