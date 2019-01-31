package gov.nih.nlm.form.test.properties;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormAddRemovePropertyTest extends NlmCdeBaseTest {

    @Test
    public void formAddRemoveProperty() {
        String formName = "Form Property Test";
        String key0 = "pk1";
        String value0 = "MyValue1";
        String key1 = "pk2";
        String value1 = "MyValue2";
        String key2 = "pk3";
        String value2 = "MyValue3";

        mustBeLoggedInAs(nlm_username, nlm_password);
        goToFormByName(formName);
        goToProperties();

        addNewProperty(key0, value0, false);
        addNewProperty(key1, value1, false);
        addNewProperty(key2, value2, false);

        clickElement(By.id("removeProperty-1"));
        clickElement(By.id("confirmRemoveProperty-1"));

        goToFormByName(formName);

        goToProperties();
        textPresent(key0);
        textPresent(value0);
        textNotPresent(key1);
        textNotPresent(value1);
        textPresent(key2);
        textPresent(value2);
    }

}
