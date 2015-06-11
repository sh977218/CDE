package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.testng.annotations.Test;

public class NumberDatatypeTest extends NlmCdeBaseTest {
    @Test
    public void numberDatatype() {
        mustBeLoggedInAs(ninds_username, password);
        String cdeName = "Risk Factor Questionnaire (RFQ) - aspirin pills per week value";
        goToCdeByName(cdeName);
        findElement(By.linkText("Permissible Values")).click();
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("editDatatype")));
        findElement(By.id("editDatatype")).click();
        new Select(findElement(By.id("valueTypeSelect"))).selectByVisibleText("Number");
        findElement(By.id("confirmDatatype")).click();

        findElement(By.xpath("//div[@id='numberMinValue']//i[@title='Edit']")).click();
        findElement(By.xpath("//div[@id='numberMaxValue']//i[@title='Edit']")).click();
        findElement(By.xpath("//div[@id='numberMinValue']//input")).sendKeys("123");
        findElement(By.xpath("//div[@id='numberMaxValue']//input")).sendKeys("456");
        findElement(By.cssSelector("#numberMinValue .fa-check")).click();
        findElement(By.cssSelector("#numberMaxValue .fa-check")).click();
        newCdeVersion();

        checkInHistory("Permissible Values - Number", "", "123");
        checkInHistory("Permissible Values - Number", "", "456");
        checkInHistory("Permissible Values - Value Type", "", "Number");

        findElement(By.linkText("Permissible Values")).click();
        findElement(By.xpath("//div[@id='numberMinValue']//i[@title='Edit']")).click();
        findElement(By.xpath("//div[@id='numberMaxValue']//i[@title='Edit']")).click();
        findElement(By.xpath("//div[@id='numberMinValue']//input")).clear();
        findElement(By.xpath("//div[@id='numberMaxValue']//input")).clear();
        findElement(By.xpath("//div[@id='numberMinValue']//input")).sendKeys("789");
        findElement(By.xpath("//div[@id='numberMaxValue']//input")).sendKeys("987");
        findElement(By.cssSelector("#numberMinValue .fa-check")).click();
        findElement(By.cssSelector("#numberMaxValue .fa-check")).click();

        newCdeVersion();

        checkInHistory("Permissible Values - Number - Minimum Value", "123", "789");
        checkInHistory("Permissible Values - Number - Maximum Value", "456", "987");

        findElement(By.linkText("Permissible Values")).click();

        //vdTest.checkInvalidEntry("numberMinValue", "ABC");
        //vdTest.checkInvalidEntry("numberMaxValue", "ABC");

    }

}