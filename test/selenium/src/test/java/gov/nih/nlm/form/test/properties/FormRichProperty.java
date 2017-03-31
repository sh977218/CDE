package gov.nih.nlm.form.test.properties;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormRichProperty extends FormPropertyTest {

    @Test
    public void richPropText() {
        String formName = "Form Rich Text Property Test";
        mustBeLoggedInAs(testAdmin_username, password);
        goToEltByName(formName, "Recorded");
        clickElement(By.id("properties_tab"));
        editPropertyValueByIndex(0, "Hello From Selenium", true);
    }

}
