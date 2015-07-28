package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
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

        Assert.assertTrue(textPresent("java.lang.Date"));
        checkInHistory("Permissible Values - Value Type", "", "java.lang.Date");
    }  
    
    @Test
    public void textDatatype() {
        mustBeLoggedInAs(ninds_username, password);
        String cdeName = "Alcohol Smoking and Substance Use Involvement Screening Test (ASSIST) - Cocaine use frequency";
        goToCdeByName(cdeName);
        findElement(By.linkText("Permissible Values")).click();
        findElement(By.id("editDatatype")).click();
        new Select(findElement(By.id("valueTypeSelect"))).selectByVisibleText("Text");
        findElement(By.id("confirmDatatype")).click();

        findElement(By.xpath("//div[@id='textMinLength']//i[@title='Edit']")).click();
        findElement(By.xpath("//div[@id='textMaxLength']//i[@title='Edit']")).click();
        findElement(By.xpath("//div[@id='textMinLength']//input")).sendKeys("789");
        findElement(By.xpath("//div[@id='textMaxLength']//input")).sendKeys("987");
        findElement(By.cssSelector("#textMinLength .fa-check")).click();
        findElement(By.cssSelector("#textMaxLength .fa-check")).click();
        newCdeVersion();    
        
        checkInHistory("Permissible Values - Text", "", "789");
        checkInHistory("Permissible Values - Text", "", "987");
        checkInHistory("Permissible Values - Value Type", "Value List", "Text");

        findElement(By.linkText("Permissible Values")).click();
        findElement(By.xpath("//div[@id='textRegex']//i[@title='Edit']")).click();
        findElement(By.xpath("//div[@id='textRule']//i[@title='Edit']")).click();
        findElement(By.xpath("//div[@id='textRule']//input")).sendKeys("newre");
        findElement(By.xpath("//div[@id='textRegex']//input")).sendKeys("newrule");
        findElement(By.cssSelector("#textRule .fa-check")).click();
        findElement(By.cssSelector("#textRegex .fa-check")).click();

        findElement(By.xpath("//div[@id='textMinLength']//i[@title='Edit']")).click();
        findElement(By.xpath("//div[@id='textMaxLength']//i[@title='Edit']")).click();
        findElement(By.xpath("//div[@id='textMinLength']//input")).clear();
        findElement(By.xpath("//div[@id='textMaxLength']//input")).clear();
        findElement(By.xpath("//div[@id='textMinLength']//input")).sendKeys("123");
        findElement(By.xpath("//div[@id='textMaxLength']//input")).sendKeys("321");
        findElement(By.cssSelector("#textMinLength .fa-check")).click();
        findElement(By.cssSelector("#textMaxLength .fa-check")).click();

        newCdeVersion();
        
        checkInHistory("Permissible Values - Text - Regular Expression", "", "newre");
        checkInHistory("Permissible Values - Text - Freetext Rule", "", "newrule");
        checkInHistory("Permissible Values - Text - Maximum Length", "789", "123");
        checkInHistory("Permissible Values - Text - Minimum Length", "987", "321");

    }
}
