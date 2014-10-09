package gov.nih.nlm.cde.test;

import org.openqa.selenium.By;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.Assert;
import org.testng.annotations.Test;

public class UserTest extends NlmCdeBaseTest {
    
    @Test
    public void wrongLogin() {
        mustBeLoggedOut();
        goToCdeSearch();
        try {
            findElement(By.linkText("Log In")).click();
        } catch (TimeoutException e) {
            logout();
            findElement(By.linkText("Log In")).click();            
        }
        
        enterUsernamePasswordSubmit("bad-username", "bad-password", "Failed to login");
    
        enterUsernamePasswordSubmit(ctepCurator_username, ctepCurator_password, "ctepCurator");
    
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
        shortWait.until(ExpectedConditions.invisibilityOfElementLocated(By.linkText("Create")));
    }
    
    @Test
    public void viewingHistory() {
        mustBeLoggedInAs(history_username, history_password);
        goToCdeByName("Patient Eligibility Ind-2");
        hangon(4);
        findElement(By.id("username_link")).click();
        findElement(By.linkText("Profile")).click();
        textPresent("Patient Eligibility Ind-2");
        
        // now see 10 other CDEs
        goToCdeByName("Specimen Inflammation Change Type");
        goToCdeByName("Person Mother Onset Menopause Age Value");
        goToCdeByName("Definition Type Definition Type String");
        goToCdeByName("Service Item Display Name java.lang.String");
        goToCdeByName("Apgar Score Created By java.lang.Long");
        goToCdeByName("Target Lesion Sum Short Longest Dimension Measurement");
        goToCdeByName("Form Element End Date");
        goToCdeByName("Treatment Text Other Text");
        goToCdeByName("Specimen Block Received Count");
        goToCdeByName("Malignant Neoplasm Metastatic Involvement Anatomic");
        hangon(4);
        
        findElement(By.id("username_link")).click();
        findElement(By.linkText("Profile")).click();
        textPresent("Specimen Inflammation Change Type");
        textPresent("Person Mother Onset Menopause Age Value");
        textPresent("Definition Type Definition Type String");
        textPresent("Service Item Display Name java.lang.String");
        textPresent("Apgar Score Created By java.lang.Long");
        textPresent("Target Lesion Sum Short Longest Dimension Measurement");
        textPresent("Form Element End Date");
        textPresent("Treatment Text Other Text");
        textPresent("Specimen Block Received Count");
        textPresent("Malignant Neoplasm Metastatic Involvement Anatomic");
        
        Assert.assertTrue(!findElement(By.cssSelector("BODY")).getText().contains("Patient Eligibility Ind-2"));
    }
    
    @Test
    public void userEmail() {
        mustBeLoggedInAs(test_username, test_password);
        findElement(By.id("username_link")).click();
        findElement(By.linkText("Profile")).click();
        Assert.assertEquals("test@example.com", findElement(By.id("dd_user_email")).getText());
        findElement(By.xpath("//div[@id='emailEdit']//i")).click();
        findElement(By.xpath("//div[@id='emailEdit']//input")).clear();
        findElement(By.xpath("//div[@id='emailEdit']//input")).sendKeys("me@");        
        Assert.assertFalse(findElement(By.xpath("//div[@id='emailEdit']//button[text()=' Confirm']")).isEnabled());
        findElement(By.xpath("//div[@id='emailEdit']//input")).sendKeys("me.com");        
        Assert.assertTrue(findElement(By.xpath("//div[@id='emailEdit']//button[text()=' Confirm']")).isEnabled());
        findElement(By.xpath("//div[@id='emailEdit']//button[text()=' Confirm']")).click();
        textPresent("Saved");                
    }

}
