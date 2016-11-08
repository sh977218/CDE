package gov.nih.nlm.form.test.classification;

import gov.nih.nlm.cde.test.BaseClassificationTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormClassificationAudit extends BaseClassificationTest {
    
    @Test
    public void formClassificationAudit() {
        mustBeLoggedInAs(testAdmin_username, password);
        goToFormByName("Functional Imaging");
        clickElement(By.id("classification_tab"));
        addClassificationMethod(new String[] {"TEST", "Eligibility Criteria"});
        openClassificationAudit("TEST > Eligibility Criteria");
        clickElement(By.linkText("Functional Imaging"));
        switchTab(1);
        textPresent("Contains data elements collected when an imaging study");
        switchTabAndClose(0);
    }

}
