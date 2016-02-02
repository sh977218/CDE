package gov.nih.nlm.form.test;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormSearch extends BaseFormTest {

    @Test
    public void findFormByCde() {
        mustBeLoggedInAs(testAdmin_username, password);
        String cdeName = "Therapeutic Procedure Created Date java.util.Date";
        String formName = "Find By CDE";
        goToCdeByName(cdeName);
        showAllTabs();
        clickElement(By.id("forms_tab"));
        textPresent(formName);
    }

    @Test
    public void noPinAllNoExport() {
        // this test will be removed when the features are implemented.
        goToFormSearch();
        clickElement(By.id("browseOrg-NINDS"));
        textPresent("Expand All");
        textNotPresent("Pin All");
    }

}
