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
        goToRelatedContent();
        goToLinkedForm();
        clickElement(By.id("linkToElt_0"));
        textPresent(formName);
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
