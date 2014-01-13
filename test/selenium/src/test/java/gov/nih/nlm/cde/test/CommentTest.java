/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

package gov.nih.nlm.cde.test;

import static gov.nih.nlm.cde.test.NlmCdeBaseTest.test_username;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

/**
 *
 * @author ludetc
 */
public class CommentTest extends NlmCdeBaseTest {
    
    @Test
    public void comments() {
        loginAs(test_username, test_password);
        goToCdeByName("Hospital Confidential Institution Referred From");
        findElement(By.linkText("Discussions")).click();
        findElement(By.name("comment")).sendKeys("My First Comment!");
        findElement(By.name("postComment")).click();
        Assert.assertTrue(textPresent("Comment added"));
        Assert.assertTrue(textPresent("testuser"));
        Assert.assertTrue(textPresent("My First Comment!"));
        findElement(By.name("comment")).sendKeys("another comment");
        findElement(By.name("postComment")).click();
        Assert.assertTrue(textPresent("Comment added"));
        findElement(By.xpath("//div[3]/div[2]/div[2]/i")).click();
        Assert.assertTrue(textPresent("Comment removed"));
        Assert.assertTrue(driver.findElement(By.cssSelector("BODY")).getText().indexOf("another comment") < 0);
        logout();
    }


    
}
