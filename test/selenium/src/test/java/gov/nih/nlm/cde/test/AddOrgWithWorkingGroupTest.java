package gov.nih.nlm.cde.test;

import gov.nih.nlm.cde.test.classification.ClassificationTest;
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
        textPresent("Organization Administrator Added");

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
        createClassificationName(orgWG, new String[]{classification});
        modalGone();
        createClassificationName(orgWG, new String[]{classification, subClassification});
        modalGone();

        // Create CDE owned by newly created working group
        String name = "Test CDE for " + orgWG;
        String definition = "Let this test pass please!!!";
        fillOutBasicCreateFields(name, definition, "CTEP", classification, subClassification);
        modalGone();
        textPresent(classification);
        textPresent(subClassification);
        clickElement(By.id("submit"));


        clickElement(By.id("editStatus"));
        new Select(driver.findElement(By.name("registrationStatus"))).selectByVisibleText("Qualified");
        clickElement(By.id("saveRegStatus"));
        closeAlert();

        clickElement(By.linkText("Classification"));
        new ClassificationTest().addClassificationMethod(new String[]{orgWG, classification, subClassification});
        waitForESUpdate();

        // Make sure ctepCurator user can see it
        goToCdeSearch();
        findElement(By.id("browseOrg-" + orgWG));

        // Make sure nlm users can see it
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToCdeSearch();
        findElement(By.id("browseOrg-" + orgWG));

        // Make sure cabigAdmin can't
        mustBeLoggedInAs(cabigAdmin_username, password);
        goToCdeSearch();
        textNotPresent(orgWG);

    }

}
