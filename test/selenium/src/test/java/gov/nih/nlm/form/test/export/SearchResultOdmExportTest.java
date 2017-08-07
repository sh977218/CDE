package gov.nih.nlm.form.test.export;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class SearchResultOdmExportTest extends NlmCdeBaseTest {
    @Test
    public void searchResultOdmExport() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToFormSearch();
        clickElement(By.id("search_by_classification_NIDA"));
        clickElement(By.id("export"));
        clickElement(By.id("odmExport"));
        
    }
}
