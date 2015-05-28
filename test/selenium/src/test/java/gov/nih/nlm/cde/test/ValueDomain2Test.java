package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.testng.annotations.Test;

public class ValueDomain2Test extends NlmCdeBaseTest {

    private ValueDomainTest vdTest = new ValueDomainTest();
    
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