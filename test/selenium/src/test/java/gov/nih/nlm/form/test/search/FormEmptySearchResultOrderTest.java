package gov.nih.nlm.form.test.search;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.testng.annotations.Test;

import java.util.List;

public class FormEmptySearchResultOrderTest extends NlmCdeBaseTest {

    @Test
    public void formEmptySearchResultOrder() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToFormSearch();
        clickElement(By.id("search_by_classification_TEST"));
        List<WebElement> registrationStatusList = findElements(By.xpath("//*[contains(@id,'registrationStatus_')]"));
        verifyRegistrationStatusOrder(registrationStatusList);
    }
}