package gov.nih.nlm.cde.test.workingGroups;

import gov.nih.nlm.cde.test.BaseClassificationTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class AddOrgWithWorkingGroupTest extends BaseClassificationTest {

    @Test
    public void addOrgWithWorkingGroupOf() {
        String orgWG = "Test Working Group 2";

        // Create some classifications for working group
        String classification1 = "ABTC";
        String classification2 = "ABTC 0904";
        String[] categories1 = new String[]{};
        String[] categories2 = new String[]{"ABTC"};
        mustBeLoggedInAs(ctepEditor_username, password);
        gotoClassificationMgt();
        selectOrgClassification(orgWG);
        addClassificationUnderPath(categories1, classification1);
        expandOrgClassification(orgWG);
        addClassificationUnderPath(categories2, classification2);
        modalGone();

        // Create CDE owned by newly created working group
        String cdeName = "Test CDE for " + orgWG;
        String cdeDefinition = "Let this test pass please!!!";
        fillOutBasicCreateFields(cdeName, cdeDefinition, "CTEP", classification1, classification2);
        modalGone();
        textPresent(classification1);
        textPresent(classification2);
        clickElement(By.id("submit"));
        editRegistrationStatus("Qualified", null, null, null, null);
        newCdeVersion();

        goToClassification();
        addClassificationByTree(orgWG, new String[]{classification1, classification2});
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
