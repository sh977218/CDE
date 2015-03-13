package gov.nih.nlm.cde.test;

import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
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

        findElement(By.xpath("//div[@id='intMinValue']//i[@title='Edit']")).click();
        findElement(By.xpath("//div[@id='intMaxValue']//i[@title='Edit']")).click();
        findElement(By.xpath("//div[@id='intMinValue']//input")).sendKeys("123");
        findElement(By.xpath("//div[@id='intMaxValue']//input")).sendKeys("456");
        findElement(By.cssSelector("#intMinValue .fa-check")).click();
        findElement(By.cssSelector("#intMaxValue .fa-check")).click();
        newCdeVersion();    
        
        checkInHistory("Permissible Values - Integer", "", "123");
        checkInHistory("Permissible Values - Integer", "", "456");
        checkInHistory("Permissible Values - Value Type", "Value List", "Integer");
        
        findElement(By.linkText("Permissible Values")).click();
        findElement(By.xpath("//div[@id='intMinValue']//i[@title='Edit']")).click();
        findElement(By.xpath("//div[@id='intMaxValue']//i[@title='Edit']")).click();
        findElement(By.xpath("//div[@id='intMinValue']//input")).clear();
        findElement(By.xpath("//div[@id='intMaxValue']//input")).clear();
        findElement(By.xpath("//div[@id='intMinValue']//input")).sendKeys("789");
        findElement(By.xpath("//div[@id='intMaxValue']//input")).sendKeys("987");
        findElement(By.cssSelector("#intMinValue .fa-check")).click();
        findElement(By.cssSelector("#intMaxValue .fa-check")).click();
        
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
        
        findElement(By.xpath("//div[@id='dateFormat']//i[@title='Edit']")).click();
        findElement(By.xpath("//div[@id='dateFormat']//input")).sendKeys("format1");
        findElement(By.cssSelector("#dateFormat .fa-check")).click();
        newCdeVersion();    
        
        checkInHistory("Permissible Values - Date", "", "format1");
        checkInHistory("Permissible Values - Value Type", "Value List", "Date");
        
        findElement(By.linkText("Permissible Values")).click();
        findElement(By.xpath("//div[@id='dateFormat']//i[@title='Edit']")).click();
        findElement(By.xpath("//div[@id='dateFormat']//input")).clear();
        findElement(By.xpath("//div[@id='dateFormat']//input")).sendKeys("format2");
        findElement(By.cssSelector("#dateFormat .fa-check")).click();
        
        newCdeVersion();
        
        checkInHistory("Permissible Values - Date - Format", "format1", "format2");                
    }    
}