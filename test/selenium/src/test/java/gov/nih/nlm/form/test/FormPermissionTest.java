
package gov.nih.nlm.form.test;

import org.openqa.selenium.By;
import org.testng.annotations.Test;


public class FormPermissionTest extends BaseFormTest {

    private CreateEditSectionTest sectionTest = new CreateEditSectionTest();

    @Test
    public void formPermissionTest() {
        mustBeLoggedInAs(ninds_username, password);
        String formName = "Fixed Dynamometry";

        goToFormByName(formName);
        findElement(By.linkText("Form Description")).click();

        String sec1 = "test permission section";
        sectionTest.addSection(sec1, "0 or more","bottom");
        textPresent(sec1);
        saveForm();

        mustBeLoggedInAs(ctepCurator_username, password);
        goToFormByName(formName);
        findElement(By.linkText("Form Description")).click();
        textNotPresent("Delete");
        textNotPresent("Add Section");
        textNotPresent("Show Question Search Area");
    }

}
