package gov.nih.nlm.cde.test.workingGroups;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.annotations.Test;

public class CreateWorkingGroup extends NlmCdeBaseTest {

    @Test
    public void createWorkingGroup() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        String orgWG = "Test Working Group";
        String orgWGLongName = orgWG + " Long Name";
        String orgWGOf = "ACRIN";
        addOrg(orgWG, orgWGLongName, orgWGOf);

        // Give nlm permission to administer working group
        clickElement(By.id("username_link"));
        clickElement(By.linkText("Org Management"));
        clickElement(By.xpath("//div[. = 'Org Admins']"));
        new Select(driver.findElement(By.name("newOrgAdminOrgName"))).selectByVisibleText(orgWG);
        findElement(By.name("searchUsersInput")).sendKeys(nlm_username);
        clickElement(By.id("newOrgAdminSubmit"));
        checkAlert("Saved");

        gotoClassificationMgt();
        new Select(driver.findElement(By.name("orgToManage"))).selectByVisibleText(orgWG);

        // Verify that Acrin Tree was duplicated
        findElement(By.linkText("Imaging Modality"));
        findElement(By.linkText("Magnetic Resonance Imaging (MRI)"));
        findElement(By.linkText("Under Review"));
        findElement(By.linkText("6701"));

    }
}
