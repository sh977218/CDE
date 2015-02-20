package gov.nih.nlm.cde.test;

import static gov.nih.nlm.cde.test.NlmCdeBaseTest.driver;
import java.util.List;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.Test;

public class StoreSearchTest extends NlmCdeBaseTest {
    
    @Test
    public void rememberText() {
        goToCdeByName("Smoking History Ind");
        driver.navigate().back();
        hangon(1);
        Assert.assertTrue("Smoking History Ind".equals(findElement(By.id("acc_link_0")).getText()));
    }
    
    @Test
    public void rememberPageNumber() {
        goToCdeSearch();
        findElement(By.linkText("2")).click();
        hangon(2);
        scrollToTop();
        findElement(By.id("acc_link_0")).click();
        hangon(1);
        findElement(By.xpath("//li[a = 'CDEs']")).click();
        hangon(1);
        scrollTo(4000);
        hangon(1);
        WebElement elt = findElement(By.xpath("//li[a = '2']"));
        Assert.assertTrue(elt.getAttribute("ng-class").contains("active"));
    }
    
    @Test
    public void rememberFacets() {
        goToCdeSearch();
        findElement(By.id("li-blank-caCORE")).click();
        findElement(By.id("li-blank-caCORE")).click();
        findElement(By.id("li-blank-CSM")).click();
        Assert.assertTrue(textPresent("2 results for"));
        List <WebElement> linkList = driver.findElements(By.cssSelector("div.panel-default"));
        Assert.assertEquals(linkList.size(), 2);
        findElement(By.id("acc_link_0")).click();
        hangon(1);
        findElement(By.xpath("//li[a = 'CDEs']")).click();
        Assert.assertTrue(textPresent("User First Name"));
        linkList = driver.findElements(By.cssSelector("div.panel-default"));
        Assert.assertEquals(linkList.size(), 2);        
    }
    
    @Test
    public void resetSearch() {
        goToCdeSearch();
        findElement(By.id("li-blank-caCORE")).click();
        findElement(By.id("li-blank-caCORE")).click();
        findElement(By.id("li-blank-CSM")).click();
        hangon(1);
        List <WebElement> linkList = driver.findElements(By.cssSelector("div.panel-default"));
        Assert.assertEquals(linkList.size(), 2);
        findElement(By.id("resetSearch")).click();
        Assert.assertTrue(textPresent("10"));
        linkList = driver.findElements(By.cssSelector("div.panel-default"));
        Assert.assertTrue(linkList.size() > 10);  
    }
    
    @Test
    public void resetSearchStatus() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToCdeByName("Administration, Management Performed Study Activity Variance Reason ISO21090.ST.v1.0");
        findElement(By.id("editStatus")).click();
        new Select(driver.findElement(By.name("registrationStatus"))).selectByVisibleText("Preferred Standard");
        findElement(By.id("saveRegStatus")).click();
        Assert.assertTrue(textPresent("Saved"));
        modalGone();
        logout();

        goToCdeSearch();
        List <WebElement> linkList = driver.findElements(By.cssSelector("div.panel-default"));
        Assert.assertTrue(textPresent("10"));
        Assert.assertTrue(linkList.size() > 10);
        findElement(By.id("li-checked-Standard")).click();
        hangon(1);
        findElement(By.id("li-checked-Qualified")).click();
        hangon(2);
        linkList = driver.findElements(By.cssSelector("div.panel-default"));        
        // Expectation, less than 10 standard CDEs when this test runs.
        Assert.assertTrue(linkList.size() < 10);
        scrollToTop();
        findElement(By.id("resetSearch")).click();
        findElement(By.id("li-checked-Standard"));
        Assert.assertTrue(textPresent("PBTC ("));
        linkList = driver.findElements(By.cssSelector("div.panel-default"));        
        Assert.assertTrue(linkList.size() > 10);
    }
    
}
