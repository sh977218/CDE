package gov.nih.nlm.cde.test.classification;

import gov.nih.nlm.cde.test.BaseClassificationTest;
import org.testng.annotations.Test;

public class AddOrgClassificationTest extends BaseClassificationTest {

    @Test
    public void addOrgClassification() {
        String org = "NINDS";
        String[] categories1 = new String[]{"Domain", "Assessments and Examinations", "Imaging Diagnostics"};
        String newClassification1 = "MRI";
        String[] categories2 = new String[]{"Domain", "Assessments and Examinations", "Imaging Diagnostics", "MRI"};
        String newClassification2 = "Contrast T1";
        mustBeLoggedInAs(ninds_username, password);
        gotoClassificationMgt();
        selectOrgClassification(org);
        expandOrgClassification(org);
        expandOrgClassificationUnderPath(new String[]{"Disease"});
        textPresent("Headache");
        addClassificationUnderPath(categories1, newClassification1);
        modalGone();
        expandOrgClassification(org);
        addClassificationUnderPath(categories2, newClassification2);
        modalGone();
        expandOrgClassification(org);
        expandOrgClassificationUnderPath(categories2);
        textPresent(newClassification2);
    }

}
