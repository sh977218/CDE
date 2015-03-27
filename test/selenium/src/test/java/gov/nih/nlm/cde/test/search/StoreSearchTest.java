package gov.nih.nlm.cde.test.search;

import gov.nih.nlm.cde.test.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
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

}
