package gov.nih.nlm.cde.test.classification;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.testng.annotations.Test;

public class DeleteOrgClassificationTest extends NlmCdeBaseTest {

    @Test
    public void deleteOrgClassification() {
        String org = "NINDS";
        mustBeLoggedInAs(ninds_username, password);
        gotoClassificationMgt();
        deleteOrgClassification(org, new String[]{"_a", "_a_a"});
        textNotPresent("_a_a_a");
    }

}
