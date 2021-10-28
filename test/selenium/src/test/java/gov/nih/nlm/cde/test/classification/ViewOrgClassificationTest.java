package gov.nih.nlm.cde.test.classification;

import gov.nih.nlm.cde.test.BaseClassificationTest;
import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class ViewOrgClassificationTest extends BaseClassificationTest {
    @Test
    public void viewOrgClassifications() {
        String org1 = "PS&CC";
        String org2 = "ACRIN";
        String[] categories1 = new String[]{"CESD"};
        String[] categories2 = new String[]{"Imaging Modality"};
        mustBeLoggedInAs(classificationMgtUser_username, password);
        gotoClassificationMgt();
        selectOrgClassification(org1);
        expandOrgClassification(org1);
        expandOrgClassificationUnderPath(categories1);
        textPresent("edu.fccc.brcf.domain");
        textNotPresent("Magnetic Resonance Imaging (MRI)");
        selectOrgClassification(org2);
        expandOrgClassification(org2);
        expandOrgClassificationUnderPath(categories2);
        textPresent("Magnetic Resonance Imaging (MRI)");
        textNotPresent("edu.fccc.brcf.domain");
    }
}
