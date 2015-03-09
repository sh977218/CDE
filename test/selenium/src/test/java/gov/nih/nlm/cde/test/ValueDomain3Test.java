package gov.nih.nlm.cde.test;

import static gov.nih.nlm.cde.test.NlmCdeBaseTest.ctepCurator_username;
import static gov.nih.nlm.cde.test.NlmCdeBaseTest.wait;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.Assert;
import org.testng.annotations.Test;
import org.openqa.selenium.support.ui.Select;

public class ValueDomain3Test extends NlmCdeBaseTest {    
    @Test
    public void integerDatatype() {
        mustBeLoggedInAs(ninds_username, password);
        String cdeName = "Alcohol Smoking and Substance Use Involvement Screening Test (ASSIST) - Tobacco product fail control indicator";
        goToCdeByName(cdeName);
        findElement(By.linkText("Permissible Values")).click();
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("editDatatype")));
        findElement(By.cssSelector("[ng-hide=\"editListTypeMode\"]")).click();       
        findElement(By.id("listDatatype_input")).sendKeys("Custom Datatype");
        findElement(By.id("confirmListType")).click();        
   
        newCdeVersion();    

        checkInHistory("Permissible Values - Value List", "", "Custom Datatype");
        
        findElement(By.linkText("Permissible Values")).click();        
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("editDatatype")));
        findElement(By.cssSelector("[ng-hide=\"editListTypeMode\"]")).click();    
        findElement(By.id("listDatatype_input")).clear();
        findElement(By.id("listDatatype_input")).sendKeys("Other Datatype");
        findElement(By.id("confirmListType")).click(); 
        
        newCdeVersion();        
        checkInHistory("Permissible Values - Value List", "Custom Datatype", "Other Datatype");           
    }      

}