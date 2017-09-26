package gov.nih.nlm.cde.test;

import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.annotations.Test;

public class adminOfMultipleOrgsCanSeeDropdownTest extends BaseClassificationTest {

    @Test
    public void adminOfMultipleOrgsCanSeeDropdown() {
        mustBeLoggedInAs(classificationMgtUser_username, password);
        gotoClassificationMgt();
        clickElement(By.cssSelector(".fa-retweet"));
        new Select(driver.findElement(By.id("selectClassificationOrg"))).selectByVisibleText("caBIG");
        textPresent("caNanoLab");
        clickElement(By.id("cancelNewClassifyItemBtn"));
    }

}
