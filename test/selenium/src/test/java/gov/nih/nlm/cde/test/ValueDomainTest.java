package gov.nih.nlm.cde.test;

import static gov.nih.nlm.cde.test.NlmCdeBaseTest.ctepCurator_username;
import static gov.nih.nlm.cde.test.NlmCdeBaseTest.wait;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.Assert;
import org.testng.annotations.Test;

public class ValueDomainTest extends NlmCdeBaseTest {
    
    @Test
    public void randomDatatype() {
        mustBeLoggedInAs(ctepCurator_username, password);
        String cdeName = "CTC Adverse Event Apnea Grade";
        goToCdeByName(cdeName);
        findElement(By.linkText("Permissible Values")).click();
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("editDatatype")));
        findElement(By.id("editDatatype")).click();
        findElement(By.name("datatypeFreeText")).clear();
        findElement(By.name("datatypeFreeText")).sendKeys("java.lang.Date");
        findElement(By.id("confirmDatatype")).click();
        newCdeVersion();
        findElement(By.linkText("Permissible Values")).click();        
        Assert.assertTrue(textPresent("java.lang.Date"));
    }  
    
    @Test
    public void multiValue() {              
        String cdeName = "Cambridge-Hopkins Restless Legs Syndrome Diagnostic Questionnaire (CH-RLSQ) - feeling most occur time";
        openCdeInList(cdeName);
        Assert.assertTrue(textPresent("Multiple Values:"));
        mustBeLoggedInAs(ninds_username, password);
        goToCdeByName(cdeName);
        findElement(By.linkText("Permissible Values")).click();
        Assert.assertTrue(findElement(By.id("multipleValues_input")).isSelected());

        cdeName = "Imaging perfusion computed tomography based identification core method type";
        
        openCdeInList(cdeName);
        Assert.assertTrue(textNotPresent("Multiple Values:"));
        goToCdeByName(cdeName);
        findElement(By.linkText("Permissible Values")).click();
        Assert.assertFalse(findElement(By.id("multipleValues_input")).isSelected());
        findElement(By.id("multipleValues_input")).click();
        
        newCdeVersion();

        goToCdeByName(cdeName);
        findElement(By.linkText("Permissible Values")).click();
        wait.until(ExpectedConditions.elementSelectionStateToBe(findElement(By.id("multipleValues_input")), true));
    }
    
    @Test
    public void otherPleaseSpecifyAndListDatatype() {
        mustBeLoggedInAs(ninds_username, password);        
        String cdeName = "Structured Clinical Interview for Pathological Gambling (SCI-PG) - withdrawal value";
        goToCdeByName(cdeName);
        findElement(By.linkText("Permissible Values")).click();
        Assert.assertFalse(findElement(By.id("otherPleaseSpecify_input")).isSelected());
        Assert.assertTrue(textNotPresent("Please Specify Text"));
        findElement(By.id("otherPleaseSpecify_input")).click();
        Assert.assertTrue(findElement(By.id("otherPleaseSpecify_input")).isSelected());
        
        findElement(By.id("listDatatype_pencil")).click();
        findElement(By.id("listDatatype_input")).sendKeys("Some DT");
        findElement(By.id("confirmListType")).click();
        
        newCdeVersion();

        goToCdeByName(cdeName);
        findElement(By.linkText("Permissible Values")).click();
        Assert.assertTrue(textPresent("Some DT"));
        wait.until(ExpectedConditions.elementSelectionStateToBe(findElement(By.id("otherPleaseSpecify_input")), true));
        Assert.assertTrue(textPresent("Please Specify Text"));
        findElement(By.xpath("//div[@id='otherPleaseSpecifyText_input']//i")).click();
        findElement(By.xpath("//div[@id='otherPleaseSpecifyText_input']//input")).clear();
        findElement(By.xpath("//div[@id='otherPleaseSpecifyText_input']//input")).sendKeys("Other Answer");
        findElement(By.xpath("//div[@id='otherPleaseSpecifyText_input']//button[text()=' Confirm']")).click();

        newCdeVersion();
        
        goToCdeByName(cdeName);
        findElement(By.linkText("Permissible Values")).click();
        Assert.assertTrue(textPresent("Other Answer"));
        
    }    
}
