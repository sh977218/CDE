package gov.nih.nlm.form.test.logic;

import gov.nih.nlm.form.test.BaseFormTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class SinglePermissibleValue extends BaseFormTest {

    @Test
    public void singlePermissibleValueTest() {
        mustBeLoggedInAs(testEditor_username, password);
        String formName = "Cancer Screening Test";
        goToFormByName(formName);
        textPresent("Female Patient Screening", By.xpath("//div[" + byValueListValueXPath("Female Gender") + "]"));
        textPresent("Breast Carcinoma Estrogen Receptor Status",
                By.xpath("//div[" + byValueListValueXPath("Female Gender") + "]//*[@id='formRenderSection_Female Patient Screening']"));

        goToPreview();
        togglePrintableLogic();
        textNotPresent("Female Patient Screening");
        textNotPresent("Breast Carcinoma Estrogen Receptor Status");
        findElement(By.xpath("//label[contains(.,'Frontal Systems Behavior Scale (FrSBE) - Disinhibition subscale T score')]/..//input")).sendKeys("200");
        textPresent("Patient Gender Category");
        clickElement(By.xpath("//*[*[normalize-space()='Patient Gender Category']]//" + byValueListValueXPath("Female Gender")));
        textPresent("Female Patient Screening");
    }

}
