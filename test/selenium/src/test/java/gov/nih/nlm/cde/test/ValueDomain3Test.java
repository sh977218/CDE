package gov.nih.nlm.cde.test;

import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.annotations.Test;

public class ValueDomain3Test extends NlmCdeBaseTest {    
    @Test
    public void integerDatatype() {
        mustBeLoggedInAs(ninds_username, password);
        String cdeName = "Alcohol Smoking and Substance Use Involvement Screening Test (ASSIST) - Tobacco product fail control indicator";
        goToCdeByName(cdeName);
        findElement(By.linkText("Permissible Values")).click();
        findElement(By.xpath("//div[@id='listDatatype']//i[@title='Edit']")).click();
        findElement(By.xpath("//div[@id='listDatatype']//input")).sendKeys("Custom Datatype");
        findElement(By.cssSelector("#listDatatype .fa-check")).click();

        newCdeVersion();    

        checkInHistory("Permissible Values - Value List", "", "Custom Datatype");
        
        findElement(By.linkText("Permissible Values")).click();
        findElement(By.xpath("//div[@id='listDatatype']//i[@title='Edit']")).click();
        findElement(By.xpath("//div[@id='listDatatype']//input")).sendKeys("Other Datatype");
        findElement(By.cssSelector("#listDatatype .fa-check")).click();
        
        newCdeVersion();        
        checkInHistory("Permissible Values - Value List", "Custom Datatype", "Other Datatype");           
    }      

}