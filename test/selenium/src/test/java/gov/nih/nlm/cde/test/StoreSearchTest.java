package gov.nih.nlm.cde.test;

import static gov.nih.nlm.cde.test.NlmCdeBaseTest.driver;
import java.util.List;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.testng.Assert;
import org.testng.annotations.Test;

public class StoreSearchTest extends NlmCdeBaseTest {
    
    @Test
    public void rememberText() {
        goToCdeByName("Smoking Status");
        driver.navigate().back();
        Assert.assertTrue("Smoking Status".equals(findElement(By.id("acc_link_0")).getText()));
    }
    
    @Test
    public void rememberPageNumber() {
        goToSearch();
        findElement(By.linkText("2")).click();
        hangon(2);
        scrollToTop();
        findElement(By.id("acc_link_0")).click();
        hangon(1);
        findElement(By.xpath("//li[a = 'Search']")).click();
        hangon(1);
        scrollTo("4000");
        hangon(1);
        WebElement elt = findElement(By.xpath("//li[a = '2']"));
        Assert.assertTrue(elt.getAttribute("ng-class").contains("active"));
    }
    
    @Test
    public void rememberFacets() {
        goToSearch();
        findElement(By.id("li-blank-caCORE")).click();
        findElement(By.id("li-blank-caCORE")).click();
        findElement(By.id("li-blank-CSM")).click();
        Assert.assertTrue(textPresent("2 hits"));
        List <WebElement> linkList = driver.findElements(By.cssSelector("div.panel-default"));
        Assert.assertEquals(linkList.size(), 2);
        findElement(By.id("acc_link_0")).click();
        hangon(1);
        findElement(By.xpath("//li[a = 'Search']")).click();
        Assert.assertTrue(textPresent("User First Name"));
        linkList = driver.findElements(By.cssSelector("div.panel-default"));
        Assert.assertEquals(linkList.size(), 2);        
    }
    
    @Test
    public void resetSearch() {
        goToSearch();
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
        findElement(By.xpath("//li[a = 'Search']")).click();
        hangon(1);
        linkList = driver.findElements(By.cssSelector("div.panel-default"));
        Assert.assertTrue(linkList.size() > 10);  
    }
    
}
