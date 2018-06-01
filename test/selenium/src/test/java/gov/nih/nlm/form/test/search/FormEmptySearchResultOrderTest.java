package gov.nih.nlm.form.test.search;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormEmptySearchResultOrderTest extends NlmCdeBaseTest {

    @Test
    public void formEmptySearchResultOrder() {
        setLowStatusesVisible();
        goToFormSearch();
        clickElement(By.id("search_by_classification_TEST"));
        textPresent("Qualified", By.id("registrationStatus_0"));
        textPresent("Qualified", By.id("registrationStatus_1"));
//        textPresent("Incomplete", By.id("registrationStatus_17"));
    }

}