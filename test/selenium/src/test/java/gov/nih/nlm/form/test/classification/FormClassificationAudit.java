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
        goToGeneralDetailForm();
        textNotPresent("Updated:", By.id("generalDiv"));

        goToClassificationForm();
        addClassificationByTree("TEST", new String[]{"Eligibility Criteria"});

        logout();
        openAuditClassification("TEST > Eligibility Criteria");
        clickElement(By.linkText("Functional Imaging"));
        switchTab(1);
        goToGeneralDetailForm();
        textNotPresent("Updated:", By.id("generalDiv"));
        textPresent("Contains data elements collected when an imaging study");
        switchTabAndClose(0);
    }

}
