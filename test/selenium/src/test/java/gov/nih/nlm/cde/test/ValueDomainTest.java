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
    
}
