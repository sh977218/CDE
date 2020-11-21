package gov.nih.nlm.cde.test.classification;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.annotations.Test;

public class ReclassifyForm extends NlmCdeBaseTest {

    @Test
    public void reclassifyForm() {
        String oldClassification = "OldFormClassification";
        String newClassification = "NewFormClassification";
        String formName = "Frontal Systems Behavioral Scale (FrSBe)";
        mustBeLoggedInAs(nlm_username, nlm_password);
        gotoClassificationMgt();
        nonNativeSelect("", "Start by choosing your Organization", "org / or Org");

        String[] categories = new String[]{oldClassification};
        clickMoreVertIcon(categories);
        clickElement(By.xpath("//button/mat-icon[normalize-space() = 'transform']"));
        textPresent("Classify CDEs in Bulk");
        new Select(findElement(By.id("selectClassificationOrg"))).selectByVisibleText("org / or Org");
        classifySubmit(new String[]{newClassification}, "");

        goToFormByName(formName);
        goToClassificationForm();
        textPresent(newClassification);
        textPresent(oldClassification);
    }

}
