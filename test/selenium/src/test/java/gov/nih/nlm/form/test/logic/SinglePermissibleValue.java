package gov.nih.nlm.form.test.logic;

import gov.nih.nlm.form.test.BaseFormTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class SinglePermissibleValue extends BaseFormTest {

    @Test
    public void singlePermissibleValueTest() {
        mustBeLoggedInAs(testAdmin_username, password);
        String formName = "Cancer Screening Test";
        goToFormByName(formName);
        textNotPresent("Female Patient Screening");
        textNotPresent("Breast Carcinoma Estrogen Receptor Status");
        findElement(By.xpath("//div[div/label[text()='Frontal Systems Behavior Scale (FrSBE) - Disinhibition " +
                "subscale T score']]/following-sibling::div//input")).sendKeys("200");
        textPresent("Patient Gender Category");
        clickElement(By.xpath("//div[div/label[text()='Patient Gender Category']]/following-sibling::div//*[text()[contains(., 'Female Gender')]]"));
        textPresent("Female Patient Screening");
    }

}
