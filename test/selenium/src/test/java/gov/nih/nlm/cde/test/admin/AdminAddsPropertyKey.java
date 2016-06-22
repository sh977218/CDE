package gov.nih.nlm.cde.test.admin;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.support.ui.Select;
import org.testng.annotations.Test;


public class AdminAddsPropertyKey extends NlmCdeBaseTest{

    @Test
    public void addRemoveProp() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        clickElement(By.id("username_link"));
        clickElement(By.linkText("Org Management"));
        clickElement(By.linkText("List Management"));
        clickElement(By.id("edit_org_props_TEST"));
        findElement(By.xpath("//div[@id='text_entry_box_TEST']//input")).sendKeys("doYouSeeThis");
        findElement(By.xpath("//div[@id='text_entry_box_TEST']//input")).sendKeys(Keys.RETURN);
        clickElement(By.id("confirmEdit_TEST"));
        goToCdeByName("Distance from Closest Margin Value");
        driver.navigate().refresh(); //it takes a while for the new element to pop up. Might even include this in a loop, up to X times
        clickElement(By.linkText("More..."));
        clickElement(By.linkText("Properties"));
        clickElement(By.id("addProperty"));
        clickElement(By.id("newPropertyKey"));
        textPresent("doYouSeeThis");
        clickElement(By.id("cancelCreate"));

        ///////////
        clickElement(By.id("username_link"));
        clickElement(By.linkText("Org Management"));
        clickElement(By.linkText("List Management"));
        clickElement(By.id("edit_org_props_TEST"));
        findElement(By.xpath("//div[@id='text_entry_box_TEST']//input")).sendKeys(Keys.BACK_SPACE);
        findElement(By.xpath("//div[@id='text_entry_box_TEST']//input")).sendKeys(Keys.BACK_SPACE);

        clickElement(By.id("confirmEdit_TEST"));
        goToCdeByName("Distance from Closest Margin Value");
        driver.navigate().refresh(); //it takes a while for the new element to pop up. Might even include this in a loop, up to X times
        clickElement(By.linkText("More..."));
        clickElement(By.linkText("Properties"));
        clickElement(By.id("addProperty"));
        clickElement(By.id("newPropertyKey"));
        textNotPresent("doYouSeeThis");




    }

}
