package gov.nih.nlm.cde.test;

import static gov.nih.nlm.cde.test.NlmCdeBaseTest.ctepCurator_username;
import static gov.nih.nlm.cde.test.NlmCdeBaseTest.wait;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.Assert;
import org.testng.annotations.Test;
import org.openqa.selenium.support.ui.Select;

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
        checkInHistory("Permissible Values - Value Type", "", "java.lang.Date");
    }  
    
    @Test
    public void textDatatype() {
        mustBeLoggedInAs(ninds_username, password);
        String cdeName = "Alcohol Smoking and Substance Use Involvement Screening Test (ASSIST) - Cocaine use frequency";
        goToCdeByName(cdeName);
        findElement(By.linkText("Permissible Values")).click();
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("editDatatype")));
        findElement(By.id("editDatatype")).click();
        new Select(findElement(By.id("valueTypeSelect"))).selectByVisibleText("Text");
        findElement(By.id("confirmDatatype")).click();
        
        findElement(By.cssSelector("dd:nth-of-type(1) .fa-pencil")).click();
        findElement(By.cssSelector("dd:nth-of-type(2) .fa-pencil")).click();
        
        findElement(By.cssSelector("[ng-show='editMinMode'] input")).sendKeys("789");
        findElement(By.cssSelector("[ng-show='editMaxMode'] input")).sendKeys("987");
        
        findElement(By.id("confirmMin")).click();
        findElement(By.id("confirmMax")).click();        

        
        newCdeVersion();
        
        checkInHistory("Permissible Values - Text", "", "789");
        checkInHistory("Permissible Values - Text", "", "987");
        checkInHistory("Permissible Values - Value Type", "", "Value List");
    }     
}
