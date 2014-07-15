package gov.nih.nlm.cde.test;

import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.Test;

public class CdeEditTest extends NlmCdeBaseTest {
    
    private void classify(String org, String classification, String subClassification) {
        findElement(By.id("selectDefault")).click();
        modalHere();        
        findElement(By.id("classifySlectOrg-"+org)).click();
        hangon(0.5);   
        findElement(By.cssSelector("[id='addClassification-"+classification+"'] span.fake-link")).click();
        findElement(By.cssSelector("[id='addClassification-"+subClassification+"'] button")).click();
        findElement(By.cssSelector(".modal-dialog .done")).click();
        modalGone();    
    }

    private void fillOutBasicCreateFields(String name, String definition, String version, String org, String classification, String subClassification) {
        findElement(By.linkText("Create")).click();
        findElement(By.linkText("CDE")).click();
        findElement(By.name("cde.designation")).sendKeys(name);
        findElement(By.name("cde.definition")).sendKeys(definition);
        if (version != null) {
            findElement(By.name("cde.version")).sendKeys(version);
        }
        new Select(findElement(By.id("cde.stewardOrg.name"))).selectByVisibleText(org);
        
        classify(org, classification, subClassification);
        
    }
    
    public void createBasicCde(String name, String definition, String version, String org, String classification, String subclassification) {
        goToSearch();
        fillOutBasicCreateFields(name, definition, version, org, classification, subclassification);
        findElement(By.id("submit")).click();
        hangon(1);
    }
    
    @Test
    public void createCdeValidationErrors() {
        mustBeLoggedInAs("classificationMgtUser", "pass");
        goHome();
        findElement(By.linkText("Create")).click();
        Assert.assertTrue(textPresent("Please enter a name"));
        findElement(By.name("cde.designation")).sendKeys("abc");
        Assert.assertTrue(textPresent("Please enter a definition"));
        findElement(By.name("cde.definition")).sendKeys("abc");
        Assert.assertTrue(textPresent("Please select a steward"));
        new Select(findElement(By.id("cde.stewardOrg.name"))).selectByVisibleText("NINDS");
        Assert.assertTrue(textPresent("Please select at least one classification"));
        classify("CTEP", "DISEASE", "Gynecologic");
        Assert.assertTrue(textPresent("Please select at least one classification owned by NINDS"));
        


    }
    
    @Test
    public void createCde() {
        mustBeLoggedInAs("classificationMgtUser", "pass");
        String name = "Abracadabra";
        String definition = "Definition for testUser CDE 1";
        String version = "1.0alpha1";
        fillOutBasicCreateFields(name, definition, version, "CTEP", "Submission and Reporting", "Breast Cancer Data Mart");

        Assert.assertTrue(textPresent("Submission and Reporting"));
        Assert.assertTrue(textPresent("Breast Cancer Data Mart"));

        new Select(findElement(By.id("cde.stewardOrg.name"))).selectByVisibleText("Select One");
        new Select(findElement(By.id("cde.stewardOrg.name"))).selectByVisibleText("NINDS");
        classify("NINDS", "Disease", "Headache");
        
   
        findElement(By.id("submit")).click();
        hangon(1);

        Assert.assertTrue(textPresent(definition));

        findElement(By.linkText("Classification")).click();
        
        Assert.assertTrue(textPresent("Submission and Reporting"));
        Assert.assertTrue(textPresent("Breast Cancer Data Mart"));        
        
        Assert.assertTrue(textPresent("Disease"));
        Assert.assertTrue(textPresent("Headache"));   

        findElement(By.linkText("Identifiers")).click();
        Assert.assertEquals(version, findElement(By.id("dd_version_nlm")).getText());        
    }
    
    @Test
    public void testAlignmentForMissingFields() {
        mustBeLoggedInAs(ctepCurator_username, ctepCurator_password);
        createBasicCde("AlignmentCDE", "Definition for alignment cde", null, "CTEP", "DISEASE", "Brain");

        goToSearch();
        openCdeInList("AlignmentCDE");
        Assert.assertEquals(findElement(By.id("dt_status")).getLocation().y, findElement(By.id("dd_status")).getLocation().y);
        findElement(By.linkText("View Full Detail")).click();
        Assert.assertEquals(findElement(By.id("dt_status")).getLocation().y, findElement(By.id("dd_status")).getLocation().y);
    }

    @Test
    public void createCdeSuggest() {
        mustBeLoggedInAs(ctepCurator_username, ctepCurator_password);
        findElement(By.linkText("Create")).click();
        findElement(By.linkText("CDE")).click();
        // wait for page to load
        hangon(3);
        Assert.assertTrue(textNotPresent("Possible Matches"));
        findElement(By.name("cde.designation")).sendKeys("10");
        hangon(3);
        Assert.assertTrue(textNotPresent("Possible Matches"));
        findElement(By.name("cde.designation")).clear();
        findElement(By.name("cde.designation")).sendKeys("ind");
        hangon(3);
        Assert.assertTrue(textPresent("Possible Matches"));
        Assert.assertTrue(textPresent("Smoking History Ind"));
    }

    @Test
    public void editCde() {
        mustBeLoggedInAs(ctepCurator_username, ctepCurator_password);
        String cdeName = "Mediastinal Lymph Node Physical Examination Specify";
        goToCdeByName(cdeName);
        findElement(By.cssSelector("i.fa-edit")).click();
        findElement(By.xpath("//span/span[2]/input")).sendKeys("[name change number 1]");
        findElement(By.cssSelector(".fa-check")).click();
        findElement(By.xpath("//dd[@id = 'dd_def']//i[@class='fa fa-edit']")).click();
        findElement(By.xpath("//div/div[2]/textarea")).sendKeys("[def change number 1]");
        findElement(By.xpath("//dd[@id='dd_def']//button[@class='fa fa-check']")).click();
        findElement(By.xpath("//dd[@id = 'dd_uom']//i[@class = 'fa fa-edit']")).click();
        findElement(By.xpath("//dd[@id = 'dd_uom']//input")).sendKeys("myUom");
        findElement(By.cssSelector("#dd_uom .fa-check")).click();
        findElement(By.cssSelector("button.btn.btn-primary")).click();
        findElement(By.name("changeNote")).sendKeys("Change note for change number 1");
        Assert.assertTrue(textPresent("This version number has already been used"));
        findElement(By.name("version")).sendKeys(".001");
        saveCde();
        goToCdeByName(cdeName);
        Assert.assertTrue(textPresent("[name change number 1]"));
        Assert.assertTrue(textPresent("[def change number 1]"));
        Assert.assertTrue(textPresent("myUom"));
        // test that label and its value are aligned. 
        Assert.assertEquals(findElement(By.id("dt_updated")).getLocation().y, findElement(By.id("dd_updated")).getLocation().y);

        findElement(By.linkText("Identifiers")).click();
        Assert.assertEquals("1.001", findElement(By.id("dd_version_nlm")).getText());                
        
        // Test history
        findElement(By.linkText("History")).click();
        Assert.assertTrue(textPresent(cdeName));
        Assert.assertTrue(textPresent("Change note for change number 1"));
        hangon(1);
        findElement(By.xpath("//table[@id = 'historyTable']//tr[2]//td[4]/a")).click();
        Assert.assertTrue(textPresent(cdeName + "[name change number 1]"));
        Assert.assertTrue(textPresent("the free text field to specify the other type of mediastinal lymph node dissection.[def change number 1]"));
        Assert.assertTrue(textNotPresent("Permissible Values:"));
        Assert.assertTrue(textNotPresent("Modified"));
        
        // View Prior Version
        findElement(By.linkText("History")).click();
        findElement(By.id("prior-0")).click();
        Assert.assertTrue(textPresent("1"));
        Assert.assertTrue(textPresent("Warning: this data element is archived."));
    }

    @Test
    public void editConcepts() {
        mustBeLoggedInAs(ctepCurator_username, ctepCurator_password);
        String cdeName = "Patient Photograph Malignant";
        
        goToCdeByName(cdeName);
        findElement(By.linkText("Concepts")).click();

        findElement(By.id("addConcept")).click();
        modalHere();
        findElement(By.name("name")).sendKeys("DEC1");
        findElement(By.name("codeId")).sendKeys("DEC_CODE_111");
        findElement(By.id("createConcept")).click();
        hangon(5);
        wait.until(ExpectedConditions.elementToBeClickable(By.id("addConcept")));
        findElement(By.id("addConcept")).click();
        modalHere();
        findElement(By.name("name")).sendKeys("OC1");
        findElement(By.name("codeId")).sendKeys("OC_CODE_111");
        new Select(driver.findElement(By.name("conceptType"))).selectByVisibleText("Class");
        findElement(By.id("createConcept")).click();
        hangon(2);

        findElement(By.id("addConcept")).click();
        modalHere();
        findElement(By.name("name")).sendKeys("Prop1");
        findElement(By.name("codeId")).sendKeys("Prop_CODE_111");
        new Select(driver.findElement(By.name("conceptType"))).selectByVisibleText("Property");
        findElement(By.id("createConcept")).click();
        hangon(2);

        findElement(By.id("openSave")).click();
        findElement(By.name("version")).sendKeys(".1");
        modalHere();
        saveCde();

        goToCdeByName(cdeName);
        findElement(By.linkText("Concepts")).click();
        Assert.assertTrue(textPresent("DEC_CODE_111"));
        Assert.assertTrue(textPresent("OC_CODE_111"));
        Assert.assertTrue(textPresent("Prop_CODE_111"));
        
        findElement(By.id("decConceptRemove-0")).click();
        findElement(By.id("ocConceptRemove-1")).click();
        findElement(By.id("propConceptRemove-3")).click();
        
        findElement(By.id("openSave")).click();
        modalHere();
        findElement(By.name("version")).sendKeys(".2");
        saveCde();
        
        goToCdeByName(cdeName);
        Assert.assertTrue(!driver.findElement(By.cssSelector("BODY")).getText().contains("DEC1"));
        Assert.assertTrue(!driver.findElement(By.cssSelector("BODY")).getText().contains("OC1"));
        Assert.assertTrue(!driver.findElement(By.cssSelector("BODY")).getText().contains("PROP1"));
    }
    
    @Test
    public void changeDefinitionFormat() {
        mustBeLoggedInAs(ctepCurator_username, ctepCurator_password);

        String cdeName = "INSS";
        goToCdeByName(cdeName);
        findElement(By.cssSelector("#dd_def .fa-edit")).click();
        findElement(By.xpath("//div/div[2]/textarea")).sendKeys("[def change: adding html characters][<b>bold</b>]");
        findElement(By.xpath("//dd[@id='dd_def']//button[@class='fa fa-check']")).click();
        findElement(By.id("openSave")).click();
        findElement(By.name("version")).sendKeys(Keys.BACK_SPACE);
        findElement(By.name("version")).sendKeys("-plaintext"); 
        saveCde();

        goToCdeByName(cdeName);   
        Assert.assertTrue(textPresent("<b>bold</b>"));
        findElement(By.cssSelector("#dd_def .fa-edit")).click();
//        findElement(By.cssSelector(".tab-pane:nth-child(1) .definitionFormatRadio button:nth-child(2)")).click();
        findElement(By.xpath("//dd[@id='dd_def']//button[text() = 'Rich Text']")).click();
        hangon(2);
        findElement(By.xpath("//dd[@id='dd_def']//button[@class='fa fa-check']")).click();
        findElement(By.id("openSave")).click();
        findElement(By.name("version")).sendKeys(Keys.BACK_SPACE);
        findElement(By.name("version")).sendKeys("-html"); 
        saveCde();
        goToCdeByName(cdeName);   
        Assert.assertTrue(textNotPresent("<b>bold</b>"));        
    }    

}
