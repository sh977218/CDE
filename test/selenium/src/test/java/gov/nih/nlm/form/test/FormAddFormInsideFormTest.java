package gov.nih.nlm.form.test;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormAddFormInsideFormTest extends BaseFormTest {
    QuestionTest questionTest = new QuestionTest();

    @Test
    public void addFormInsideFormTest() {
        String formName = "Vital Signs";
        mustBeLoggedInAs(ninds_username, password);
        goToFormByName(formName);
        clickElement(By.id("description_tab"));
        textPresent("Show Question Search Area");
        startAddingForms();
        questionTest.addFormToSection("Vessel Imaging Angiography", 0);
        textPresent("Embedded Form: Vessel Imaging Angiography");
        saveForm();

        goToFormByName(formName);
        textPresent("This form is large and is not automatically displayed.");
        clickElement(By.id("renderPreviewButton"));
        clickElement(By.id("nativeFormRenderLink"));
        textPresent("Embedded Form: Vessel Imaging Angiography");

        clickElement(By.id("export"));
        textPresent("XML File, ODM Schema");
        clickElement(By.id("odmExport"));
        switchTab(1);
        textPresent("<ItemDef DataType=\"text\" Name=\"Vessel Imaging Angiography\" OID=\"undefined_s0_q1\">");
        switchTabAndClose(0);

        clickElement(By.id("export"));
        textPresent("XML File, SDC Schema");
        clickElement(By.id("sdcExport"));
        switchTab(1);
        textPresent("Vessel Imaging Angiography");
        switchTabAndClose(0);

    }

}
