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
        goToGeneralDetailForm();
        textPresent("LOINC");
        textPresent("CHAR");
        goToIdentifiersForm();
        textPresent("1234567");
        goToGeneralDetailForm();
        textPresent("CHAR");
        clickElement(By.id("copyFormBtn"));
        textPresent("Create a copy");
        textPresent("Disease/Injury Related Events");
        clickElement(By.id("submit"));
        textPresent("Incomplete", By.cssSelector("[itemprop='registrationStatus']"));
        textPresent("Copy of: Type, Place, Cause and Mechanism of Injury", By.cssSelector("[itemprop='name']"));
        textNotPresent("LOINC");
        textNotPresent("CHAR");

        textPresent("Copy of: XyqIIyrBtx");
        goToIdentifiersForm();
        textNotPresent("1234567");
    }

}
