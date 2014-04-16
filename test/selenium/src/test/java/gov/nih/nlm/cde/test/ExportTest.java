package gov.nih.nlm.cde.test;

import java.util.List;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.Assert;
import org.testng.annotations.Test;

public class ExportTest extends NlmCdeBaseTest {
    
    @Test
    public void gridView() {
        goHome();
        findElement(By.linkText("ACRIN (3)")).click();
        hangon(2);
        findElement(By.linkText(" Grid View")).click();
        wait.until(ExpectedConditions.presenceOfElementLocated(By.id("exportLink")));
        List<WebElement> rows = driver.findElements(By.xpath("//div[@class='ngCanvas']/div"));
        Assert.assertEquals(3, rows.size());
        Assert.assertTrue(textPresent("2751534v1"));
        Assert.assertTrue(textPresent("2826783v1"));
        Assert.assertTrue(textPresent("2751478v1"));
    }
    
}
