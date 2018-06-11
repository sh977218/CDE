package gov.nih.nlm.form.test.classification;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormClassificationAudit extends NlmCdeBaseTest {

    @Test
    public void formClassificationAudit() {
        String formName = "Functional Imaging";
        mustBeLoggedInAs(testAdmin_username, password);
        goToFormByName(formName);
        goToClassification();
        addClassificationByTree("TEST", new String[]{"Eligibility Criteria"});

        logout();
        openClassificationAudit("TEST > Eligibility Criteria");
        clickElement(By.linkText("Functional Imaging"));
        switchTab(1);
        goToGeneralDetail();
        textPresent("Contains data elements collected when an imaging study");
        switchTabAndClose(0);
    }

}
