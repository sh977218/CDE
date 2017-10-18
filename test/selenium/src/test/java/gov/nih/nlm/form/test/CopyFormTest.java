package gov.nih.nlm.form.test;

import gov.nih.nlm.cde.test.BaseClassificationTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class CopyFormTest extends BaseClassificationTest {

    @Test
    public void copyForm() {
        String formName = "Type, Place, Cause and Mechanism of Injury";
        mustBeLoggedInAs(ninds_username, password);
        goToFormByName(formName);
        textPresent("LOINC");
        textPresent("CHAR");
        clickElement(By.id("ids_tab"));
        textPresent("1234567");
        clickElement(By.id("copyFormBtn"));
        textPresent("Create a copy");
        textPresent("Disease/Injury Related Events");
        clickElement(By.id("submit"));
        clickElement(By.id("general_tab"));
        textPresent("Incomplete", By.id("registrationStatus"));
        textPresent("Copy of: Type, Place, Cause and Mechanism of Injury", By.id("dd_general_name"));
        textNotPresent("LOINC");
        textNotPresent("CHAR");

        textPresent("Copy of: XyqIIyrBtx");
        clickElement(By.id("ids_tab"));
        textNotPresent("1234567");
    }

}
