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
        
        enterUsernamePasswordSubmit("bad-username", "bad-password", "Failed to log in.");
    
        enterUsernamePasswordSubmit(ctepCurator_username, password, "ctepCurator");
    
    }
    
    @Test
    public void curatorProfile() {
        mustBeLoggedInAs(cabigAdmin_username, password);
        findElement(By.id("username_link")).click();
        findElement(By.linkText("Profile")).click();
        Assert.assertEquals("cabigAdmin", findElement(By.id("username")).getText());
        Assert.assertEquals("1,024.00 MB", findElement(By.id("quota")).getText());
        Assert.assertEquals("", findElement(By.id("curatorFor")).getText());
        Assert.assertEquals("caBIG", findElement(By.id("adminFor")).getText());
    }

    @Test
    public void regUserCannotCreate() {
        mustBeLoggedInAs(reguser_username, password);
        findElement(By.id("username_link"));
        shortWait.until(ExpectedConditions.invisibilityOfElementLocated(By.linkText("Create")));
    }

    private void checkUserHistory(String cdeName) {
        goToCdeByName(cdeName);
        findElement(By.id("username_link")).click();
        findElement(By.linkText("Profile")).click();
        textPresent(cdeName);
    }

    @Test
    public void viewingHistory() {
        mustBeLoggedInAs(history_username, password);
        goToCdeByName("Patient Eligibility Ind-2");
        hangon(4);
        findElement(By.id("username_link")).click();
        findElement(By.linkText("Profile")).click();
        textPresent("Patient Eligibility Ind-2");
        
        // now see 10 other CDEs
        checkUserHistory("Specimen Inflammation Change Type");
        checkUserHistory("Person Mother Onset Menopause Age Value");
        checkUserHistory("Definition Type Definition Type String");
        checkUserHistory("Service Item Display Name java.lang.String");
        checkUserHistory("Apgar Score Created By java.lang.Long");
        checkUserHistory("Target Lesion Sum Short Longest Dimension Measurement");
        checkUserHistory("Form Element End Date");
        checkUserHistory("Treatment Text Other Text");
        checkUserHistory("Specimen Block Received Count");
        checkUserHistory("Malignant Neoplasm Metastatic Involvement Anatomic");

        textNotPresent("Patient Eligibility Ind-2");
    }
    
    @Test
    public void userEmail() {
        mustBeLoggedInAs(test_username, test_password);
        findElement(By.id("username_link")).click();
        findElement(By.linkText("Profile")).click();
        Assert.assertEquals("test@example.com", findElement(By.id("user_email")).getText());
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
