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
        checkInHistory("Permissible Values - Value Type", "Value List", "Text");
        
        findElement(By.linkText("Permissible Values")).click();
        findElement(By.cssSelector("dd:nth-of-type(3) .fa-pencil")).click();
        findElement(By.cssSelector("dd:nth-of-type(4) .fa-pencil")).click();        
        findElement(By.cssSelector("[ng-show='editRegexMode'] input")).sendKeys("newre");
        findElement(By.cssSelector("[ng-show='editRuleMode'] input")).sendKeys("newrule");        
        findElement(By.id("confirmRegex")).click();
        findElement(By.id("confirmRule")).click();
        
        findElement(By.cssSelector("dd:nth-of-type(1) .fa-pencil")).click();
        findElement(By.cssSelector("dd:nth-of-type(2) .fa-pencil")).click();        
        findElement(By.cssSelector("[ng-show='editMinMode'] input")).clear();
        findElement(By.cssSelector("[ng-show='editMaxMode'] input")).clear();          
        findElement(By.cssSelector("[ng-show='editMinMode'] input")).sendKeys("123");
        findElement(By.cssSelector("[ng-show='editMaxMode'] input")).sendKeys("321");        
        findElement(By.id("confirmMin")).click();
        findElement(By.id("confirmMax")).click();         
        
        newCdeVersion();
        
        checkInHistory("ermissible Values - Text - Regular Expression", "", "newre");
        checkInHistory("Permissible Values - Text - Freetext Rule", "", "newrule");
        checkInHistory("Permissible Values - Text - Maximum Length", "789", "123");
        checkInHistory("Permissible Values - Text - Minimum Length", "987", "321");                
    }     
    
    @Test
    public void integerDatatype() {
        mustBeLoggedInAs(ninds_username, password);
        String cdeName = "Alcohol Smoking and Substance Use Involvement Screening Test (ASSIST) - Desire cocaine frequency";
        goToCdeByName(cdeName);
        findElement(By.linkText("Permissible Values")).click();
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("editDatatype")));
        findElement(By.id("editDatatype")).click();
        new Select(findElement(By.id("valueTypeSelect"))).selectByVisibleText("Integer");
        findElement(By.id("confirmDatatype")).click();
        
        findElement(By.cssSelector("dd:nth-of-type(1) .fa-pencil")).click();
        findElement(By.cssSelector("dd:nth-of-type(2) .fa-pencil")).click();        
        findElement(By.cssSelector("[ng-show='editMinMode'] input")).sendKeys("123");
        findElement(By.cssSelector("[ng-show='editMaxMode'] input")).sendKeys("456");        
        findElement(By.id("confirmMin")).click();
        findElement(By.id("confirmMax")).click();       
        newCdeVersion();    
        
        checkInHistory("Permissible Values - Integer", "", "123");
        checkInHistory("Permissible Values - Integer", "", "456");
        checkInHistory("Permissible Values - Value Type", "Value List", "Integer");
        
        findElement(By.linkText("Permissible Values")).click();        
        findElement(By.cssSelector("dd:nth-of-type(1) .fa-pencil")).click();
        findElement(By.cssSelector("dd:nth-of-type(2) .fa-pencil")).click();        
        findElement(By.cssSelector("[ng-show='editMinMode'] input")).clear();
        findElement(By.cssSelector("[ng-show='editMaxMode'] input")).clear();          
        findElement(By.cssSelector("[ng-show='editMinMode'] input")).sendKeys("789");
        findElement(By.cssSelector("[ng-show='editMaxMode'] input")).sendKeys("987");        
        findElement(By.id("confirmMin")).click();
        findElement(By.id("confirmMax")).click();         
        
        newCdeVersion();
        
        checkInHistory("Permissible Values - Integer - Minimum Value, "123", "789");
        checkInHistory("Permissible Values - Integer - Maximum Value", "456", "987");                
    }      
    
    @Test
    public void dateDatatype() {
        mustBeLoggedInAs(ninds_username, password);
        String cdeName = "Cisternal compression type";
        goToCdeByName(cdeName);
        findElement(By.linkText("Permissible Values")).click();
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("editDatatype")));
        findElement(By.id("editDatatype")).click();
        new Select(findElement(By.id("valueTypeSelect"))).selectByVisibleText("Date");
        findElement(By.id("confirmDatatype")).click();
        
        findElement(By.cssSelector("dd:nth-of-type(1) .fa-pencil")).click();    
        findElement(By.cssSelector("[ng-show='editFormatMode'] input")).sendKeys("format1");    
        findElement(By.id("confirmFormat")).click();      
        newCdeVersion();    
        
        checkInHistory("Permissible Values - Date", "", "123");
        checkInHistory("Permissible Values - Value Type", "Value List", "Date");
        
        findElement(By.linkText("Permissible Values")).click();        
        findElement(By.cssSelector("dd:nth-of-type(1) .fa-pencil")).click();       
        findElement(By.cssSelector("[ng-show='editFormatMode'] input")).clear();        
        findElement(By.cssSelector("[ng-show='editFormatMode'] input")).sendKeys("format2");      
        findElement(By.id("confirmFormat")).click();        
        
        newCdeVersion();
        
        checkInHistory("Permissible Values - Date - Format", "format1", "format2");                
    }        
}
