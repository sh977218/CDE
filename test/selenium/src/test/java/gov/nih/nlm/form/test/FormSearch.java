package gov.nih.nlm.form.test;

import junit.framework.Assert;
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
        textPresent("There are 1 forms that use this CDE");
        clickElement(By.id("seeAllLinkedFormsButton"));
        switchTab(1);
        textPresent("1 results for qz-W3XYk7jF");
        textPresent("Find By CDE");
        switchTabAndClose(0);
    }

    @Test
    public void noPinAllNoExport() {
        // this test will be removed when the features are implemented.
        goToFormSearch();
        clickElement(By.id("browseOrg-NINDS"));
        Assert.assertTrue(Integer.parseInt(findElement(By.id("searchResultNum")).getText().trim()) > 600);
        textNotPresent("Pin All");
    }

}
