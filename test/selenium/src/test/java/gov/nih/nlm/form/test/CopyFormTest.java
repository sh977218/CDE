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
        clickElement(By.id("copyFormBtn"));
        textPresent("Create a copy");
        textPresent("Disease/Injury Related Events");
        clickElement(By.id("saveCopy"));
        hangon(1);
        showAllTabs();
        textPresent("Incomplete", By.id("dd_status"));
        textPresent("Copy of: Type, Place, Cause and Mechanism of Injury", By.id("dd_general_name"));
        clickElement(By.id("status_tab"));
        textPresent("Copy of: XyqIIyrBtx");
    }

}
