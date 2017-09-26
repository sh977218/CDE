package gov.nih.nlm.cde.test.classification;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.testng.annotations.Test;

public class AddOrgClassificationTest extends NlmCdeBaseTest {

    @Test
    public void addOrgClassification() {
        String org = "NINDS";
        mustBeLoggedInAs(ninds_username, password);
        gotoClassificationMgt();
        textPresent("Headache");
        createOrgClassification(org, new String[]{"Domain", "Assessments and Examinations", "Imaging Diagnostics", "MRI"});
        modalGone();
        createOrgClassification(org, new String[]{"Domain", "Assessments and Examinations", "Imaging Diagnostics", "MRI", "Contrast T1"});
        modalGone();
    }

}
