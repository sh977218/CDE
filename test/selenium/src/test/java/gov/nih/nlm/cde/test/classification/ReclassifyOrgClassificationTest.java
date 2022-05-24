package gov.nih.nlm.cde.test.classification;

import gov.nih.nlm.cde.test.BaseClassificationTest;
import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.annotations.Test;

public class ReclassifyOrgClassificationTest extends BaseClassificationTest {

    @Test
    public void reclassifyOrgClassification() {
        String org = "org / or Org";
        String oldClassification = "OldClassification";
        String newClassification = "OldFormClassification";
        String cdeName = "Gastrointestinal therapy water flush status";
        String[] categories1 = new String[]{oldClassification};
        String[] newCategories = new String[]{newClassification};
        mustBeLoggedInAs(nlm_username, nlm_password);
        gotoClassificationMgt();
        selectOrgClassification(org);
        expandOrgClassification(org);
        reclassifyClassificationUnderPath(org, categories1, oldClassification, newCategories);

        goToCdeByName(cdeName);
        goToClassification();
        textPresent(newClassification);
        textPresent(oldClassification);

        goToAudit();

        clickElement(By.xpath("//div[. = 'Classification Audit Log']"));
        textPresent("Gastrointestinal therapy water flush status");
        textPresent("org / or Org > OldFormClassification");
    }

}
