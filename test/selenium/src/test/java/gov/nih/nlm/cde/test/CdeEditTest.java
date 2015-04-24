package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class CdeEditTest extends NlmCdeBaseTest {
 
    @Test
    public void editCde() {
        mustBeLoggedInAs(ctepCurator_username, password);
        String cdeName = "Mediastinal Lymph Node Physical Examination Specify";
        goToCdeByName(cdeName);
        findElement(By.cssSelector("i.fa-edit")).click();
        findElement(By.xpath("//div[@id='nameEdit']//input")).sendKeys("[name change number 1]");
        findElement(By.cssSelector(".fa-check")).click();
        findElement(By.xpath("//dd[@id = 'dd_def']//i[@class='fa fa-edit']")).click();
        findElement(By.xpath("//div/div[2]/textarea")).sendKeys("[def change number 1]");
        findElement(By.xpath("//dd[@id='dd_def']//button[@class='fa fa-check']")).click();
        findElement(By.xpath("//dd[@id = 'dd_uom']//i[@class = 'fa fa-edit']")).click();
        findElement(By.xpath("//dd[@id = 'dd_uom']//input")).sendKeys("myUom");
        findElement(By.cssSelector("#dd_uom .fa-check")).click();
        newCdeVersion("Change note for change number 1");
        goToCdeByName(cdeName);
        textPresent("[name change number 1]");
        textPresent("[def change number 1]");
        textPresent("myUom");
        // test that label and its value are aligned. 
        Assert.assertEquals(findElement(By.id("dt_updated")).getLocation().y, findElement(By.id("dd_updated")).getLocation().y);

        findElement(By.linkText("Identifiers")).click();
        Assert.assertEquals("1.1", findElement(By.id("dd_version_nlm")).getText());                
        
        // Test history
        findElement(By.linkText("History")).click();
        textPresent(cdeName);
        textPresent("Change note for change number 1");
        hangon(1);
        showHistoryDiff(0);
        textPresent(cdeName + "[name change number 1]");
        textPresent("the free text field to specify the other type of mediastinal lymph node dissection.[def change number 1]");
        
        confirmCdeModification("Primary Name", cdeName, cdeName + "[name change number 1]");
        confirmCdeModification("Primary Definition", "the free text field to specify the other type of mediastinal lymph node dissection.", "the free text field to specify the other type of mediastinal lymph node dissection.[def change number 1]");        
        
        
        // View Prior Version
        findElement(By.linkText("History")).click();
        showHistoryFull(1);
        textPresent("1");
        textPresent("Warning: this data element is archived.");
        
        findElement(By.linkText("view the current version here")).click();
        textPresent("[name change number 1]");
        textPresent("[def change number 1]");
        textPresent("myUom");
        
        openCdeAudit(cdeName);
        textPresent(cdeName + "[name change number 1]");
        textPresent("the free text field to specify the other type of mediastinal lymph node dissection.[def change number 1]");        
        
         
    }
    
    @Test
    public void doNotSaveIfPendingChanges() {   
        mustBeLoggedInAs(ctepCurator_username, password);
        String cdeName = "ATRA Agent Current Report Period Administered Ind-2";
        goToCdeByName(cdeName);
        findElement(By.cssSelector("i.fa-edit")).click();
        findElement(By.xpath("//div[@id='nameEdit']//input")).sendKeys("[name change number 1]");
        findElement(By.cssSelector(".fa-check")).click();
        findElement(By.linkText("Classification")).click();
        
        Assert.assertFalse(findElement(By.id("addClassification")).isEnabled());
        
        findElement(By.linkText("Properties")).click();

        findElement(By.id("addProperty")).click();
        findElement(By.name("key")).sendKeys("MyKey2");
        findElement(By.name("value")).sendKeys("MyValue2");
        findElement(By.id("createProperty")).click();
        Assert.assertTrue(textPresent("Property added. Save to confirm."));
        closeAlert();
        modalGone();
        findElement(By.id("removeProperty-0")).click();
        findElement(By.id("confirmRemoveProperty-0")).click();
        Assert.assertTrue(textPresent("Property removed. Save to confirm."));
        closeAlert();

        findElement(By.linkText("Identifiers")).click();
        findElement(By.id("addId")).click();
        findElement(By.name("source")).sendKeys("MyOrigin1");
        findElement(By.name("id")).sendKeys("MyId1");
        findElement(By.name("version")).sendKeys("MyVersion1");
        findElement(By.id("createId")).click();
        Assert.assertTrue(textPresent("Identifier added. Save to confirm."));
        modalGone();
        closeAlert();
        findElement(By.id("removeId-1")).click();
        findElement(By.id("confirmRemoveId-1")).click();
        Assert.assertTrue(textPresent("Identifier removed. Save to confirm."));        
    }
    
    
}
