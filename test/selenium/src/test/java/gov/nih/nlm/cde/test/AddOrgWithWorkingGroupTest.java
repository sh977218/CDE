package gov.nih.nlm.cde.test;

import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.annotations.Test;

public class AddOrgWithWorkingGroupTest extends BaseClassificationTest {

    @Test
    public void addOrgWithWorkingGroupOf() {
        // Create working group
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
        textPresent("Saved");
        closeAlert();

        // Create some classifications for working group
        String classification = "DISEASE";
        String subClassification = "Phase II Lung Cancer";
        mustBeLoggedInAs(ctepCurator_username, password);
        gotoClassificationMgt();
        new Select(driver.findElement(By.name("orgToManage"))).selectByVisibleText(orgWG);

        // Verify that Acrin Tree was duplicated
        findElement(By.linkText("Imaging Modality"));
        findElement(By.linkText("Magnetic Resonance Imaging (MRI)"));
        findElement(By.linkText("Under Review"));
        findElement(By.linkText("6701"));
        createOrgClassification(orgWG, new String[]{classification, subClassification});
        modalGone();

        // Create CDE owned by newly created working group
        String cdeName = "Test CDE for " + orgWG;
        String cdeDefinition = "Let this test pass please!!!";
        fillOutBasicCreateFields(cdeName, cdeDefinition, "CTEP", classification, subClassification);
        modalGone();
        textPresent(classification);
        textPresent(subClassification);
        clickElement(By.id("submit"));
        editRegistrationStatus("Qualified", null, null, null, null);
        newCdeVersion();

        goToClassification();
        addClassificationByTree(orgWG, new String[]{classification, subClassification});
        waitForESUpdate();
        // Make sure ctepCurator user can see it
        goToCdeSearch();
        findElement(By.xpath("//*[@id='browseOrg-" + orgWG + "']"));

        // Make sure nlm users can see it
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToCdeSearch();
        findElement(By.xpath("//*[@id='browseOrg-" + orgWG + "']"));

        // Make sure cabigAdmin can't
        mustBeLoggedInAs(cabigAdmin_username, password);
        goToCdeSearch();
        textNotPresent(orgWG);

    }

}
