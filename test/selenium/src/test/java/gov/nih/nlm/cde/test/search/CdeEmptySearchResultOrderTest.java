package gov.nih.nlm.cde.test.search;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.testng.annotations.Test;

import java.util.List;

public class CdeEmptySearchResultOrderTest extends NlmCdeBaseTest {

    @Test
    public void cdeEmptySearchResultOrder() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToCdeSearch();
        clickElement(By.id("search_by_classification_GRDR"));
        List<WebElement> registrationStatusList = findElements(By.xpath("//*[contains(@id,'registrationStatus_')]"));
        verifyRegistrationStatusOrder(registrationStatusList);
    }

}