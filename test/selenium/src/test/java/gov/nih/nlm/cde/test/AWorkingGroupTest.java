package gov.nih.nlm.cde.test;

import gov.nih.nlm.cde.test.regstatus.CdeRegStatusTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.annotations.Test;

public class AWorkingGroupTest extends BaseClassificationTest {
    
    @Test
    public void addOrgWithWorkingGroupOf() {
        // Create working group
        mustBeLoggedInAs(nlm_username, nlm_password);
        String orgWG = "Test Working Group";
        String orgWGLongName = "Test Working Group Long Name";
        String orgWGOf = "ACRIN";
        addOrg(orgWG, orgWGLongName, orgWGOf);
        
        // Give ctepCurator permission to administer working group
        findElement(By.id("username_link")).click();
        findElement(By.linkText("Site Management")).click();
        findElement(By.linkText("Org Admins")).click();
        new Select(driver.findElement(By.name("newOrgAdminOrgName"))).selectByVisibleText(orgWG);
        findElement(By.id("newOrgAdminUsername")).sendKeys(ctepCurator_username);
        findElement(By.id("newOrgAdminSubmit")).click();
        textPresent("Organization Administrator Added");
        
        // Create some classifications for working group
        String classification = "DISEASE";
        String subClassification = "Phase II Lung Cancer";
        mustBeLoggedInAs(ctepCurator_username, password);
        gotoClassifMgt();
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
        String name = "Test CDE for Test Working Group";
        String definition = "Let this test pass please!!!";
        fillOutBasicCreateFields(name, definition, "CTEP", classification, subClassification);
        modalGone();
        textPresent(classification);
        textPresent(subClassification);
        findElement(By.id("submit")).click();
        waitForESUpdate();

        new CdeRegStatusTest().changeRegistrationStatus("Test CDE for Test Working Group", ctepCurator_username, "Incomplete", "Recorded");
        waitForESUpdate();

        goToCdeByName("Test CDE for Test Working Group", "Recorded");
        findElement(By.linkText("Classification")).click();
        new ClassificationTest().addClassificationMethod(new String[]{"Test Working Group", classification, subClassification});
        hangon(3);
                
        // Make sure ctepCurator user can see it
        goToCdeSearch();
        findElement(By.id("browseOrg-Test Working Group"));

        // Make sure nlm users can see it
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToCdeSearch();
        findElement(By.id("browseOrg-Test Working Group"));
        
        // Make sure cabigAdmin can't
        mustBeLoggedInAs(cabigAdmin_username, password);
        goToCdeSearch();
        textNotPresent("Test Working Group");

    }
   
}
