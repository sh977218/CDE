package gov.nih.nlm.form.test.export;

import gov.nih.nlm.form.test.BaseFormTest;
import gov.nih.nlm.system.RecordVideo;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class RedCapExport extends BaseFormTest {

    @Test
    public void promisCanNotExportRedCap() {
        mustBeLoggedInAs(testAdmin_username, password);
        goToFormByName("PROMIS SF v2.0 - Instrumental Support 8a");
        enableBetaFeature();
        clickElement(By.id("export"));
        clickElement(By.id("nihRedCap"));
        switchTab(1);
        textPresent("You can download PROMIS / Neuro-QOL REDCap from here.");
        switchTabAndClose(0);
    }

    @Test
    public void phenxCanNotExportRedCap() {
        mustBeLoggedInAs(testAdmin_username, password);
        goToFormByName("PhenX Form RedCAP Export");
        enableBetaFeature();
        clickElement(By.id("export"));
        clickElement(By.id("nihRedCap"));
        switchTab(1);
        textPresent("You can download PhenX REDCap from here.");
        switchTabAndClose(0);
    }

}
