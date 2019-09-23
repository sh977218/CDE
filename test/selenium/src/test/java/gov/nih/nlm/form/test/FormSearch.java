package gov.nih.nlm.form.test;

import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class FormSearch extends BaseFormTest {

    @Test
    public void findFormByCde() {
        mustBeLoggedInAs(testAdmin_username, password);
        String cdeName = "Therapeutic Procedure Created Date java.util.Date";
        String formName = "Find By CDE";
        goToCdeByName(cdeName);

        clickElement(By.id("openLinkedFormsModalBtn"));
        textPresent("There is 1 form that uses this cde");
        textPresent(formName);
        clickElement(By.id("seeAllLinkedFormsButton"));
        switchTab(1);
        textPresent("1 results for qz_W3XYk7jF");
        textPresent(formName);
        switchTabAndClose(0);
    }

    @Test
    public void noPinAllNoExport() {
        // this test will be removed when the features are implemented.
        goToFormSearch();
        clickElement(By.id("browseOrg-NINDS"));
        Assert.assertTrue(getNumberOfResults() > 600);
        textNotPresent("Pin All");
    }

}
