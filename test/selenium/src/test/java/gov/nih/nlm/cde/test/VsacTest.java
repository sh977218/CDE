package gov.nih.nlm.cde.test;

import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.testng.Assert;

/**
 *
 * @author ludetc
 */
public class VsacTest extends NlmCdeBaseTest {
    
    @Test
    public void assignVsacId() {
        goToCdeByName("Patient Ethnic Group Category");
        findElement(By.linkText("Permissible Values"));
        Assert.assertTrue(textPresent("No Value Set specified."));
        findElement(By.linkText("Update O.I.D")).click();
        findElement(By.name("vsacId")).sendKeys("invalid Id");
        findElement(By.cssSelector("button.icon-ok")).click();
        Assert.assertTrue(textPresent("Invalid VSAC OID"));

        findElement(By.linkText("Update O.I.D")).click();
        findElement(By.name("vsacId")).sendKeys("2.16.840.1.114222.4.11.837");
        findElement(By.cssSelector("button.icon-ok")).click();
        // check that version got fetched.
        Assert.assertTrue(textPresent("20121025"));

        findElement(By.name("changeNote")).sendKeys("Adding vsac Id");
        Assert.assertTrue(textPresent("This version number has already been used"));
        findElement(By.name("version")).sendKeys(Keys.BACK_SPACE);
        findElement(By.name("version")).sendKeys("3");
        findElement(By.cssSelector("button.btn.btn-warning")).click();

        goToCdeByName("Patient Ethnic Group Category");
        findElement(By.linkText("Permissible Values"));
        Assert.assertTrue(textPresent("20121025"));

        
    }
    
}
