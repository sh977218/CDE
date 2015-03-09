package gov.nih.nlm.cde.test;

import static gov.nih.nlm.cde.test.NlmCdeBaseTest.ctepCurator_username;
import static gov.nih.nlm.cde.test.NlmCdeBaseTest.wait;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.Assert;
import org.testng.annotations.Test;
import org.openqa.selenium.support.ui.Select;

public class ValueDomain2Test extends NlmCdeBaseTest {    
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
        
        checkInHistory("Permissible Values - Integer - Minimum Value", "123", "789");
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
        
        checkInHistory("Permissible Values - Date", "", "format1");
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