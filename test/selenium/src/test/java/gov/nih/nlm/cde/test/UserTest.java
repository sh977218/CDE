/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

package gov.nih.nlm.cde.test;

import static gov.nih.nlm.cde.test.NlmCdeBaseTest.wait;
import org.openqa.selenium.By;
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
        driver.get(baseUrl + "/");
        findElement(By.linkText("Log In")).click();
        findElement(By.id("uname")).clear();
        findElement(By.id("uname")).sendKeys("bad-username");
        findElement(By.id("passwd")).clear();
        findElement(By.id("passwd")).sendKeys("bad-password");
        findElement(By.cssSelector("input.btn")).click();
        Assert.assertTrue(textPresent("Incorrect username or password"));
    }
    
    @Test
    public void curatorProfile() {
        loginAs(ctepCurator_username, ctepCurator_password);
        findElement(By.linkText("Account")).click();
        findElement(By.linkText("Profile")).click();
        Assert.assertEquals("ctepCurator", findElement(By.id("dd_username")).getText());
        Assert.assertEquals("1,024.00 MB", findElement(By.id("dd_quota")).getText());
        Assert.assertEquals("[\"CTEP\"]", findElement(By.id("dd_curatorFor")).getText());
        Assert.assertEquals("[]", findElement(By.id("dd_adminFor")).getText());
        logout();
    }

    @Test
    public void adminProfile() {
        loginAs(cabigAdmin_username, cabigAdmin_password);
        findElement(By.linkText("Account")).click();
        findElement(By.linkText("Profile")).click();
        Assert.assertEquals("cabigAdmin", findElement(By.id("dd_username")).getText());
        Assert.assertEquals("1,024.00 MB", findElement(By.id("dd_quota")).getText());
        Assert.assertEquals("[]", findElement(By.id("dd_curatorFor")).getText());
        Assert.assertEquals("[\"caBIG\"]", findElement(By.id("dd_adminFor")).getText());
        logout();
    }
    
    @Test
    public void regUserCannotCreate() {
        loginAs("user1", "pass");
        findElement(By.linkText("Account"));
        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.linkText("Create")));
        logout();
    }

}
