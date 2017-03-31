package gov.nih.nlm.form.test.properties;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormAddRemovePropertiesTest extends NlmCdeBaseTest {

    @Test
    public void formAddRemoveProperty() {
        String formName  = "Form Property Test";
        String key0 = "propKey0";
        String value0 = "MyValue0";
        String key1 = "propKey1";
        String value1 = "MyValue1";
        String key2 = "propKey2";
        String value2 = "MyValue2";

        mustBeLoggedInAs(ninds_username, password);
        goToCdeByName(formName);
        clickElement(By.id("properties_tab"));

        addNewProperty(key0, value0);
        addNewProperty(key1, value1);
        addNewProperty(key2, value2);

        clickElement(By.id("removeProperty-1"));
        clickElement(By.id("confirmRemoveProperty-1"));
        textPresent("Property Removed");
        closeAlert();

        goToCdeByName(formName);

        clickElement(By.id("properties_tab"));
        textPresent(key0);
        textPresent(value0);
        textNotPresent(key1);
        textNotPresent(value1);
        textPresent(key2);
        textPresent(value2);
    }

}
