package gov.nih.nlm.system;

import gov.nih.nlm.cde.test.BaseClassificationTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class UpdateOrgClassification extends BaseClassificationTest {
    @Test
    public void updateOrgClassificationTest() {
        String org = "TEST";
        String[] categories = new String[]{"Denise Test CS"};
        mustBeLoggedInAs(nlm_username, nlm_password);
        gotoClassificationMgt();
        selectOrgClassification(org);
        expandOrgClassification(org);
        expandOrgClassificationUnderPath(categories);
        textPresent("Denise Sentinel CSI");
        textNotPresent("AIRR demo");
        clickElement(By.id("updateOrgBtn"));
        expandOrgClassification(org);
        textPresent("AIRR demo");
    }
}
