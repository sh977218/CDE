
package gov.nih.nlm.form.test.properties.test;

import org.openqa.selenium.By;
import org.testng.annotations.Test;


public class FormPermissionTest extends BaseFormTest {

    @Test
    public void formPermissionTest() {
        mustBeLoggedInAs(ninds_username, password);
        String formName = "Fixed Dynamometry";

        goToFormByName(formName);
        clickElement(By.id("description_tab"));

        String sec1 = "test permission section";
        addSectionBottom(sec1, "0 or more");
        textPresent(sec1);
        saveForm();

        mustBeLoggedInAs(ctepCurator_username, password);
        goToFormByName(formName);
        clickElement(By.id("description_tab"));
        textNotPresent("Delete");
        textNotPresent("Add Section");
        textNotPresent("Show Question Search Area");
    }

}
