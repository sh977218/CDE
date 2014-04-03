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
        goHome();
        findElement(By.linkText("2")).click();
        findElement(By.id("acc_link_0")).click();
        hangon(1);
        driver.navigate().back();
        hangon(1);
        WebElement elt = findElement(By.xpath("//li[/a = '2']"));
        Assert.assertTrue(elt.getAttribute("class").contains("active"));
    }
    
    @Test
    public void rememberFacets() {
        goHome();
        findElement(By.id("li-blank-caCORE")).click();
        findElement(By.id("li-blank-caCORE")).click();
        findElement(By.id("li-blank-CSM")).click();
        hangon(1);
        List <WebElement> linkList = driver.findElements(By.cssSelector("div.panel-default"));
        Assert.assertEquals(linkList.size(), 2);
        findElement(By.id("acc_link_0")).click();
        hangon(1);
        driver.navigate().back();
        hangon(1);
        linkList = driver.findElements(By.cssSelector("div.panel-default"));
        Assert.assertEquals(linkList.size(), 2);        
    }
    
    @Test
    public void resetSearch() {
        goHome();
    }
    
}
