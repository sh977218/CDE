package gov.nih.nlm.cde.test;

import java.util.List;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.Select;

import org.testng.annotations.Test;

public class WorkingGroupTest extends NlmCdeBaseTest {
    
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
        findElement(By.linkText("Organizations Admins")).click();
        new Select(driver.findElement(By.name("admin.orgName"))).selectByVisibleText(orgWG);
        findElement(By.id("orgAdmin.username")).sendKeys(ctepCurator_username);
        findElement(By.id("addOrgAdmin")).click();
        textPresent("Organization Administrator Added");
        
        // Create some classifications for working group
        String classification = "DISEASE";
        String subClassification = "Phase II Lung Cancer";
        mustBeLoggedInAs(ctepCurator_username, ctepCurator_password);
        gotoClassifMgt();
        new Select(driver.findElement(By.name("orgToManage"))).selectByVisibleText(orgWG);
        
        // Verify that Acrin Tree was duplicated
        findElement(By.linkText("Imaging Modality"));
        findElement(By.linkText("Magnetic Resonance Imaging (MRI)"));
        findElement(By.linkText("Under Review"));
        findElement(By.linkText("6701"));
        createClassificationName(new String[]{classification});
        modalGone();
        createClassificationName(new String[]{classification, subClassification});
        modalGone();
                
        // Create CDE owned by newly created working group
        String name = "Test CDE for Test Working Group";
        String definition = "Let this test pass please!!!";
        String version = "1.0";
        fillOutBasicCreateFields(name, definition, version, orgWG, classification, subClassification);
        modalGone();
        textPresent(classification);
        textPresent(subClassification);
        findElement(By.id("submit")).click();
        hangon(1);
        
        // Make sure ctepCurator user can see it
        goToCdeSearch();
        textPresent("Test Working Group (");
        
        // Make sure nlm users can see it
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToCdeSearch();
        textPresent("Test Working Group (");
        
        // Make sure cabigAdmin can't
        mustBeLoggedInAs(cabigAdmin_username, cabigAdmin_password);
        goToCdeSearch();
        textNotPresent("Test Working Group (");
    }
    
    @Test
    public void wgRegStatus() {
        mustBeLoggedInAs(wguser_username, common_password);
        new CdeCreateTest().createBasicCde("WG Test CDE", "Def", null, "WG-TEST", "WG Classif", "WG Sub Classif");
        findElement(By.id("editStatus")).click();
        List<WebElement> options = new Select(driver.findElement(By.name("registrationStatus"))).getOptions();
        for (WebElement option : options) {
            Assert.assertNotEquals("Qualified", option.getText());
            Assert.assertNotEquals("Recorded", option.getText());
        }
    }
    
}
