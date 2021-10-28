package gov.nih.nlm.cde.test.workingGroups;

import gov.nih.nlm.cde.test.BaseClassificationTest;
import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.annotations.Test;

public class CreateWorkingGroup extends BaseClassificationTest {

    @Test
    public void createWorkingGroup() {
        String orgWG = "Test Working Group";
        String orgWGLongName = orgWG + " Long Name";
        String orgWGOf = "ACRIN";
        mustBeLoggedInAs(nlm_username, nlm_password);
        addOrg(orgWG, orgWGLongName, orgWGOf);

        goToAdmins();
        new Select(driver.findElement(By.name("newOrgAdminOrgName"))).selectByVisibleText(orgWG);
        searchUsername(nlm_username);
        clickElement(By.id("newOrgAdminSubmit"));
        checkAlert("Saved");

        gotoClassificationMgt();
        selectOrgClassification(orgWG);

        // Verify that Acrin Tree was duplicated
        expandOrgClassification(orgWG);
        String[] categories1 = new String[]{"Imaging Modality"};
        String[] categories2 = new String[]{"Under Review"};
        expandOrgClassificationUnderPath(categories1);
        findElement(By.linkText("Imaging Modality"));
        findElement(By.linkText("Magnetic Resonance Imaging (MRI)"));
        expandOrgClassificationUnderPath(categories2);
        findElement(By.linkText("Under Review"));
        findElement(By.linkText("6701"));

    }
}
