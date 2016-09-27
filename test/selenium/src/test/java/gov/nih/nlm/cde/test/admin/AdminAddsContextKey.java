package gov.nih.nlm.cde.test.admin;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.TimeoutException;
import org.testng.annotations.Test;

public class AdminAddsContextKey extends NlmCdeBaseTest {
    @Test
    public void addRemoveContext() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        clickElement(By.id("username_link"));
        clickElement(By.linkText("Org Management"));
        clickElement(By.linkText("List Management"));
        clickElement(By.id("edit_org_propsContext_TEST"));
        findElement(By.xpath("//div[@id='text_context_entry_box_TEST']//input")).sendKeys("canYouSeeThis");
        findElement(By.xpath("//div[@id='text_context_entry_box_TEST']//input")).sendKeys(Keys.RETURN);
        hangon(1);
        clickElement(By.id("confirmContextEdit_TEST"));
        textPresent("Org has been updated");
        closeAlert();
        driver.get(driver.getCurrentUrl());
        clickElement(By.linkText("List Management"));
        textPresent("canYouSeeThis", By.xpath("//tr[td[@id='orgListName-TEST']]"));
        goToCdeByName("Distance from Closest Margin Value");
        clickElement(By.linkText("Naming"));
        clickElement(By.id("addNamePair"));
        textPresent("Contexts are managed in Org Management > List Management");

        try {
            clickElement(By.id("newContext"));
            textPresent("canYouSeeThis");
        } catch (TimeoutException e) {
            System.out.println(driver.getPageSource());
            clickElement(By.id("newContext"));
            textPresent("canYouSeeThis");
        }
        clickElement(By.id("cancelCreate"));
        clickElement(By.id("username_link"));
        clickElement(By.linkText("Org Management"));
        clickElement(By.linkText("List Management"));
        scrollToViewById("edit_org_propsContext_TEST");
        clickElement(By.id("edit_org_propsContext_TEST"));
        clickElement(By.xpath("//li[span/span[contains(.,'canYouSeeThis')]]/a"));
        clickElement(By.id("confirmContextEdit_TEST"));
        goToCdeByName("Distance from Closest Margin Value");
        clickElement(By.linkText("Naming"));
        clickElement(By.id("addNamePair"));
        clickElement(By.id("newContext"));
        textNotPresent("canYouSeeThis");
    }

}
