package gov.nih.nlm.cde.test.workingGroups;

import gov.nih.nlm.cde.test.BaseClassificationTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class AddOrgWithWorkingGroupTest extends BaseClassificationTest {

    @Test
    public void addOrgWithWorkingGroupOf() {
        String orgWG = "Test Working Group 2";

        // Create some classifications for working group
        String classification = "DISEASE";
        String subClassification = "Phase II Lung Cancer";
        mustBeLoggedInAs(ctepEditor_username, password);
        gotoClassificationMgt();
        nonNativeSelect("", "Start by choosing your Organization", orgWG);

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
        // Make sure ctepEditor user can see it
        goToCdeSearch();
        findElement(By.xpath("//*[@id='browseOrg-" + orgWG + "']"));

        // Make sure nlm users can see it
        logout();
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToCdeSearch();
        findElement(By.xpath("//*[@id='browseOrg-" + orgWG + "']"));

        // Make sure cabigEditor can't
        logout();
        mustBeLoggedInAs(classificationMgtUser_username, password);
        goToCdeSearch();
        textNotPresent(orgWG);

    }

}
