/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

package gov.nih.nlm.cde.test;

import static gov.nih.nlm.cde.test.NlmCdeBaseTest.wait;
import org.openqa.selenium.By;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.Assert;
import org.testng.annotations.Test;

/**
 *
 * @author ludetc
 */
public class UserTest extends NlmCdeBaseTest {
    
    @Test
    public void wrongLogin() {
        mustBeLoggedOut();
        goHome();
        try {
            findElement(By.linkText("Log In")).click();
        } catch (TimeoutException e) {
            logout();
            findElement(By.linkText("Log In")).click();            
        }
        findElement(By.id("uname")).clear();
        findElement(By.id("uname")).sendKeys("bad-username");
        findElement(By.id("passwd")).clear();
        findElement(By.id("passwd")).sendKeys("bad-password");
        findElement(By.cssSelector("button.btn")).click();
        Assert.assertTrue(textPresent("Incorrect username or password"));
    }
    
    @Test
    public void curatorProfile() {
        mustBeLoggedInAs(ctepCurator_username, ctepCurator_password);
        findElement(By.id("username_link")).click();
        findElement(By.linkText("Profile")).click();
        Assert.assertEquals("ctepCurator", findElement(By.id("dd_username")).getText());
        Assert.assertEquals("1,024.00 MB", findElement(By.id("dd_quota")).getText());
        Assert.assertEquals("[\"CTEP\"]", findElement(By.id("dd_curatorFor")).getText());
        Assert.assertEquals("[]", findElement(By.id("dd_adminFor")).getText());
    }

    @Test
    public void regUserCannotCreate() {
        mustBeLoggedInAs("reguser", "pass");
        findElement(By.id("username_link"));
        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.linkText("Create")));
    }
    
    @Test
    public void viewingHistory() {
        mustBeLoggedInAs(history_username, history_password);
        goToCdeByName("Patient Eligibility Ind-2");
        findElement(By.id("username_link")).click();
        findElement(By.linkText("Profile")).click();
        Assert.assertTrue(textPresent("Patient Eligibility Ind-2"));
        
        // now see 10 other CDEs
        goToCdeByName("Specimen Inflammation Change Type");
        goToCdeByName("Person Mother Onset Menopause Age Value");
        goToCdeByName("Definition Type Definition Type String");
        goToCdeByName("Service Item Display Name java.lang.String");
        goToCdeByName("Apgar Score Created By java.lang.Long");
        goToCdeByName("Target Lesion Sum Short Longest Dimension Measurement");
        goToCdeByName("Smoking Cessation Other Method Specify Text");
        goToCdeByName("Treatment Text Other Text");
        goToCdeByName("Specimen Block Received Count");
        goToCdeByName("Malignant Neoplasm Metastatic Involvement Anatomic");
        
        findElement(By.id("username_link")).click();
        findElement(By.linkText("Profile")).click();
        Assert.assertTrue(textPresent("Specimen Inflammation Change Type"));
        Assert.assertTrue(textPresent("Person Mother Onset Menopause Age Value"));
        Assert.assertTrue(textPresent("Definition Type Definition Type String"));
        Assert.assertTrue(textPresent("Service Item Display Name java.lang.String"));
        Assert.assertTrue(textPresent("Apgar Score Created By java.lang.Long"));
        Assert.assertTrue(textPresent("Target Lesion Sum Short Longest Dimension Measurement"));
        Assert.assertTrue(textPresent("Smoking Cessation Other Method Specify Text"));
        Assert.assertTrue(textPresent("Treatment Text Other Text"));
        Assert.assertTrue(textPresent("Specimen Block Received Count"));
        Assert.assertTrue(textPresent("Malignant Neoplasm Metastatic Involvement Anatomic"));
        
        Assert.assertTrue(!findElement(By.cssSelector("BODY")).getText().contains("Patient Eligibility Ind-2"));
    }

}
