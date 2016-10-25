package gov.nih.nlm.form.test;

import gov.nih.nlm.cde.test.BaseClassificationTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class CopyFormTest extends BaseClassificationTest {

    @Test
    public void copyCde() {
        mustBeLoggedInAs(ninds_username, password);
        String formName = "Type, Place, Cause and Mechanism of Injury";
        goToFormByName(formName);
        textPresent("LOINC");
        textPresent("CHAR");
        showAllTabs();
        clickElement(By.id("ids_tab"));
        textPresent("1234567");
        clickElement(By.id("copyFormBtn"));
        textPresent("Create a copy");
        textPresent("Disease/Injury Related Events");
        clickElement(By.id("saveCopy"));
        textPresent("Incomplete", By.id("dd_status"));
        textPresent("Copy of: " + formName, By.id("dd_general_name"));
        textNotPresent("LOINC");
        textNotPresent("CHAR");
        showAllTabs();
        clickElement(By.id("status_tab"));
        textPresent("Copy of: XyqIIyrBtx");
        clickElement(By.id("ids_tab"));
        textNotPresent("1234567");
    }

}
