package gov.nih.nlm.form.test;

import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class FormSearch extends BaseFormTest {

    @Test
    public void findFormByCde() {
        mustBeLoggedInAs(testEditor_username, password);
        String cdeName = "Therapeutic Procedure Created Date java.util.Date";
        String formName = "Find By CDE";
        goToCdeByName(cdeName);

        clickElement(By.id("openLinkedFormsModalBtn"));
        textPresent("There is 1 form that uses this cde");
        textPresent(formName);
        clickElement(By.xpath("//button[contains(.,'See all linked forms')]"));
        switchTab(1);
        textPresent("1 form results");
        textPresent("qz_W3XYk7jF", By.id("term_crumb"));
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
