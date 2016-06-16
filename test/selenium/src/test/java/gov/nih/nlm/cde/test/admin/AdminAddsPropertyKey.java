package gov.nih.nlm.cde.test.admin;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.support.ui.Select;
import org.testng.annotations.Test;


public class AdminAddsPropertyKey extends NlmCdeBaseTest{

    @Test
    public void addRemoveProp() {
        mustBeLoggedInAs(testAdmin_username, password);
        clickElement(By.id("username_link"));
        clickElement(By.linkText("Org Management"));
        clickElement(By.linkText("List Management"));
        clickElement(By.id("edit_org_props_38"));
        findElement(By.id("text_entry_box_38")).sendKeys("doYouSeeThis");
        findElement(By.id("text_entry_box_38")).sendKeys(Keys.RETURN);
        clickElement(By.id("confirmEdit_38"));
        goToCdeByName("WG Test CDE");
        driver.navigate().refresh(); //it takes a while for the new element to pop up. Might even include this in a loop, up to X times
        clickElement(By.id("newPropertyKey"));
        textPresent("doYouSeeThis");


    }
    @Test
    public void doNotForgetToFinishThisTest(){
        clickElement(By.id("AUTOMATIC FAILURE"));

    }

}
