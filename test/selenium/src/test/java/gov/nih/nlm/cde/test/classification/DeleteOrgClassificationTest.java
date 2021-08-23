package gov.nih.nlm.cde.test.classification;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class DeleteOrgClassificationTest extends NlmCdeBaseTest {

    @Test
    public void deleteOrgClassification() {
        String org = "NINDS";
        mustBeLoggedInAs(ninds_username, password);
        gotoClassificationMgt();
        textPresent("Therapies", By.xpath("//*[@id='Domain,Treatment/Intervention Data']/../../.."));
        deleteOrgClassification(org, new String[]{"Domain", "Treatment/Intervention Data","Therapies"});
        textNotPresent("Therapies", By.xpath("//*[@id='Domain,Treatment/Intervention Data']/../../.."));
    }

}
