package gov.nih.nlm.cde.test.admin;

import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.testng.annotations.Test;
import gov.nih.nlm.system.NlmCdeBaseTest;
public class AdminAddsContextKey extends NlmCdeBaseTest{
    @Test
    public void addRemoveContext() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        clickElement(By.id("username_link"));
        clickElement(By.linkText("Org Management"));
        clickElement(By.linkText("List Management"));
        clickElement(By.id("edit_org_propsContext_TEST"));
        findElement(By.xpath("//div[@id='text_context_entry_box_TEST']//input")).sendKeys("canYouSeeThis");
        findElement(By.xpath("//div[@id='text_context_entry_box_TEST']//input")).sendKeys(Keys.RETURN);
        clickElement(By.id("confirmContextEdit_TEST"));
        goToCdeByName("Distance from Closest Margin Value");
        driver.navigate().refresh(); //it takes a while for the new element to pop up. Might even include this in a loop, up to X times
        clickElement(By.linkText("Naming"));
        clickElement(By.id("addNamePair"));
        clickElement(By.id("newContext"));
        textPresent("canYouSeeThis");
        clickElement(By.id("cancelCreate"));
//*[@id="text_context_entry_box_TEST"]/ul/li/input
        //*[@id="text_context_entry_box_TEST"]
        //*[@id="text_entry_box_TEST"]
        ///////////
        clickElement(By.id("username_link"));
        clickElement(By.linkText("Org Management"));
        clickElement(By.linkText("List Management"));
        clickElement(By.id("edit_org_propsContext_TEST"));
        findElement(By.xpath("//div[@id='text_context_entry_box_TEST']//input")).sendKeys(Keys.BACK_SPACE);
        findElement(By.xpath("//div[@id='text_context_entry_box_TEST']//input")).sendKeys(Keys.BACK_SPACE);
        clickElement(By.id("confirmContextEdit_TEST"));
        goToCdeByName("Distance from Closest Margin Value");
        driver.navigate().refresh(); //it takes a while for the new element to pop up. Might even include this in a loop, up to X times
        clickElement(By.linkText("Naming"));
        clickElement(By.id("addNamePair"));
        clickElement(By.id("newContext"));
        textNotPresent("canYouSeeThis");




    }

}
