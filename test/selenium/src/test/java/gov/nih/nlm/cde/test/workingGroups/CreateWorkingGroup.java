package gov.nih.nlm.cde.test.workingGroups;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.annotations.Test;

public class CreateWorkingGroup extends NlmCdeBaseTest {

    @Test
    public void addOrgWithWorkingGroupOf() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        String orgWG = "Test Working Group";
        String orgWGLongName = orgWG + " Long Name";
        String orgWGOf = "ACRIN";
        addOrg(orgWG, orgWGLongName, orgWGOf);

        // Give ctepCurator permission to administer working group
        clickElement(By.id("username_link"));
        clickElement(By.linkText("Org Management"));
        clickElement(By.linkText("Org Admins"));
        new Select(driver.findElement(By.name("newOrgAdminOrgName"))).selectByVisibleText(orgWG);
        findElement(By.id("newOrgAdminUsername")).sendKeys(ctepCurator_username);
        clickElement(By.id("newOrgAdminSubmit"));
        checkAlert("Saved");
    }
}
