package gov.nih.nlm.cde.test.classification;

import gov.nih.nlm.cde.test.BaseClassificationTest;
import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.annotations.Test;

public class ReclassifyForm extends BaseClassificationTest {

    @Test
    public void reclassifyForm() {
        String org = "org / or Org";
        String[] categories = new String[]{"OldFormClassification"};
        String oldClassification = "OldFormClassification";
        String[] newCategories = new String[]{"OldClassification"};
        String newClassification = "OldClassification";
        String formName = "Frontal Systems Behavioral Scale (FrSBe)";
        mustBeLoggedInAs(nlm_username, nlm_password);
        gotoClassificationMgt();
        selectOrgClassification(org);
        expandOrgClassification(org);
        reclassifyClassificationUnderPath(org, categories, oldClassification, newCategories);
        goToFormByName(formName);
        goToClassification();
        textPresent(newClassification);
        textPresent(oldClassification);
    }

}
