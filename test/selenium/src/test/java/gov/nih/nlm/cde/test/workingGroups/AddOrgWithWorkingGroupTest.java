package gov.nih.nlm.cde.test.workingGroups;

import gov.nih.nlm.cde.test.BaseClassificationTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.annotations.Test;

public class AddOrgWithWorkingGroupTest extends BaseClassificationTest {

    @Test
    public void addOrgWithWorkingGroupOf() {
        String orgWG = "Test Working Group 2";
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
        logout();
        mustBeLoggedInAs(nlm_username, nlm_password);
        findElement(By.xpath("//*[@id='browseOrg-" + orgWG + "']"));

        // Make sure cabigAdmin can't
        logout();
        mustBeLoggedInAs(cabigAdmin_username, password);
        textNotPresent(orgWG);

    }

}
