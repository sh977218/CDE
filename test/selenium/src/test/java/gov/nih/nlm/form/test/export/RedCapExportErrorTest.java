package gov.nih.nlm.form.test.export;

import gov.nih.nlm.form.test.BaseFormTest;
import gov.nih.nlm.system.RecordVideo;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class RedCapExportErrorTest extends BaseFormTest {

    @Test
    @RecordVideo
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
    @RecordVideo
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

    @Test
    @RecordVideo
    public void canNotExportRedCapOfEmptySectionForm() {
        mustBeLoggedInAs(testAdmin_username, password);
        goToFormByName("Empty Section Form");
        enableBetaFeature();
        clickElement(By.id("export"));
        clickElement(By.id("nihRedCap"));
        switchTab(1);
        textPresent("REDCap cannot support empty section.");
        switchTabAndClose(0);
    }

    @Test
    @RecordVideo
    public void canNotExportRedCapOfSectionInsideSectionForm() {
        mustBeLoggedInAs(testAdmin_username, password);
        goToFormByName("Section Inside Section Form");
        enableBetaFeature();
        clickElement(By.id("export"));
        clickElement(By.id("nihRedCap"));
        switchTab(1);
        textPresent("REDCap cannot support nested section.");
        switchTabAndClose(0);
    }
}
