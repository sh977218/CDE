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
        findElement(By.id("li-blank-AECC")).click();
        hangon(2);
        findElement(By.id("gridView")).click();
        wait.until(ExpectedConditions.presenceOfElementLocated(By.id("exportLink")));
        List<WebElement> rows = driver.findElements(By.xpath("//div[@class='ngCanvas']/div"));
        Assert.assertEquals(7, rows.size());
        Assert.assertTrue(textPresent("3436564v2"));
        Assert.assertTrue(textPresent("2746311v1"));
        Assert.assertTrue(textPresent("2182832v1"));
    }
    
}
