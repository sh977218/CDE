package gov.nih.nlm.cde.test;

import static gov.nih.nlm.cde.test.NlmCdeBaseTest.ctepCurator_username;
import static gov.nih.nlm.cde.test.NlmCdeBaseTest.driver;
import static gov.nih.nlm.cde.test.NlmCdeBaseTest.wait;
import java.util.List;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.Assert;
import org.testng.annotations.Test;

/**
 *
 * @author ludetc
 */
public class ValueDomainTest extends NlmCdeBaseTest {
    
    @Test
    public void assignVsacId() {
        loginAs(nlm_username, nlm_password);
        goToCdeByName("Patient Ethnic Group Category");
        findElement(By.linkText("Permissible Values")).click();
        Assert.assertTrue(textPresent("No Value Set specified."));
        findElement(By.linkText("Update O.I.D")).click();
        findElement(By.name("vsacId")).sendKeys("invalidId");
        findElement(By.id("vsacIdCheck")).click();
        Assert.assertTrue(textPresent("Invalid VSAC OID"));
        findElement(By.linkText("Update O.I.D")).click();
        findElement(By.name("vsacId")).sendKeys("2.16.840.1.114222.4.11.837");
        findElement(By.id("vsacIdCheck")).click();
        // check that version got fetched.
        Assert.assertTrue(textPresent("20121025"));
        findElement(By.cssSelector("button.btn.btn-primary")).click();
        findElement(By.name("changeNote")).sendKeys("Adding vsac Id");
        Assert.assertTrue(textPresent("This version number has already been used"));
        findElement(By.name("version")).sendKeys(Keys.BACK_SPACE);
        findElement(By.name("version")).sendKeys("3");
        findElement(By.cssSelector("button.btn.btn-warning")).click();
        logout();
    }

    @Test
            (dependsOnMethods = {"assignVsacId"})
    public void vsacTable() {
        goToCdeByName("Patient Ethnic Group Category");
        findElement(By.linkText("Permissible Values")).click();
        Assert.assertTrue(textPresent("20121025"));
        Assert.assertTrue(textPresent("2135-2"));
        Assert.assertTrue(textPresent("CDCREC"));
        List<WebElement> vsacLines = driver.findElements(By.xpath("//tbody[@id='vsacTableBody']/tr"));
        Assert.assertEquals(vsacLines.size(), 2);
    }
    
    @Test
    public void changePermissibleValue() {
        loginAs(ctepCurator_username, ctepCurator_password);
        goToCdeByName("Patient Ethnic Group Category");
        findElement(By.linkText("Permissible Values")).click();        
        findElement(By.xpath("//td[@id='pv-0']/inline-edit/span/span[1]/i")).click();
        findElement(By.xpath("//td[@id='pv-0']/inline-edit/span/span[2]/input")).sendKeys(" added to pv");
        findElement(By.xpath("//td[@id='pv-0']/inline-edit/span/span[2]/i[1]")).click();
        findElement(By.cssSelector("button.btn.btn-primary")).click();
        findElement(By.name("changeNote")).sendKeys("Changed PV");
        findElement(By.name("version")).sendKeys(Keys.BACK_SPACE);
        findElement(By.name("version")).sendKeys("4");
        findElement(By.cssSelector("button.btn.btn-warning")).click();
        goToCdeByName("Patient Ethnic Group Category");
        findElement(By.linkText("Permissible Values")).click();
        Assert.assertTrue(textPresent("added to pv"));
        logout();
    }
    
    @Test
        (dependsOnMethods = {"assignVsacId"})
    public void linkPvToVsac() {
        loginAs(ctepCurator_username, ctepCurator_password);
        goToCdeByName("Patient Ethnic Group Category");
        findElement(By.linkText("Permissible Values")).click();   
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//td[@id='pvName-1']//i")));
        findElement(By.xpath("//td[@id='pvName-1']//i")).click();
        findElement(By.xpath("//td[@id='pvName-1']//input")).sendKeys(Keys.BACK_SPACE);
        findElement(By.xpath("//td[@id='pvName-1']//input")).sendKeys("o");
        findElement(By.xpath("//td[@id='pvName-1']/div/div[2]/i[1]")).click();
        findElement(By.cssSelector("button.btn.btn-primary")).click();
        findElement(By.name("version")).sendKeys(Keys.BACK_SPACE);
        findElement(By.name("version")).sendKeys("6");
        findElement(By.cssSelector("button.btn.btn-warning")).click();
        driver.get(baseUrl + "/");
        findElement(By.name("search.name")).sendKeys("Patient Ethnic Group Category");
        findElement(By.id("search.submit")).click();
        findElement(By.partialLinkText("Patient Ethnic Group Category")).click();
        Assert.assertTrue(textPresent("2135-2"));
        logout();
    }
    
    @Test
            (dependsOnMethods = {"assignVsacId"})
    public void visibilityOfPvLink() {
        loginAs(ctepCurator_username, ctepCurator_password);
        goToCdeByName("Patient Ethnic Group Category");
        findElement(By.linkText("Permissible Values")).click();
        // following asserts
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//td[@id='pvName-1']//i")));
        goToCdeByName("Involved Organ Laterality Type");
        findElement(By.linkText("Permissible Values")).click();
        // following asserts
        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.xpath("//td[@id='pvName-1']//i")));
        logout();
    }

    @Test
    public void addRemovePv() {
        loginAs(ctepCurator_username, ctepCurator_password);
        goToCdeByName("Surgical Procedure Hand Laparoscopic Port Anatomic Site");
        findElement(By.linkText("Permissible Values")).click();
        Assert.assertTrue(textPresent("Right Middle Abdomen"));
        findElement(By.id("pvRemove-8")).click();
        findElement(By.id("addPv")).click();
        findElement(By.xpath("//td[@id='pv-10']/inline-edit/span/span[1]/i")).click();
        findElement(By.xpath("//td[@id='pv-10']/inline-edit/span/span[2]/input")).clear();
        findElement(By.xpath("//td[@id='pv-10']/inline-edit/span/span[2]/input")).sendKeys("New PV");
        findElement(By.xpath("//td[@id='pv-10']/inline-edit/span/span[2]/i[1]")).click();
        findElement(By.cssSelector("button.btn.btn-primary")).click();
        findElement(By.name("changeNote")).sendKeys("Changed PV");
        findElement(By.name("version")).sendKeys(Keys.BACK_SPACE);
        findElement(By.name("version")).sendKeys(".addRemovePv");
        findElement(By.cssSelector("button.btn.btn-warning")).click();
        goToCdeByName("Surgical Procedure Hand Laparoscopic Port Anatomic Site");
        findElement(By.linkText("Permissible Values")).click();
        Assert.assertTrue(textPresent("New PV"));
        Assert.assertEquals(driver.findElement(By.cssSelector("BODY")).getText().indexOf("Right Middle Abdomen"), -1);
        logout();
    }
    
    @Test
    public void reOrderPv() {
        loginAs(ctepCurator_username, ctepCurator_password);
        goToCdeByName("Involved Organ Laterality Type");
        findElement(By.linkText("Permissible Values")).click();
        Assert.assertEquals(findElement(By.id("pvCode-2")).getText(), "C25229");
        Assert.assertEquals(findElement(By.id("pvCode-6")).getText(), "C25594,C48046,C13717");
        findElement(By.id("pvUp-2")).click();
        findElement(By.id("pvDown-6")).click();
                findElement(By.cssSelector("button.btn.btn-primary")).click();
        findElement(By.name("changeNote")).sendKeys("Reordered PV");
        findElement(By.name("version")).sendKeys(".addRemovePv");
        findElement(By.cssSelector("button.btn.btn-warning")).click();
        goToCdeByName("Involved Organ Laterality Type");
        findElement(By.linkText("Permissible Values")).click();
        Assert.assertEquals(findElement(By.id("pvCode-1")).getText(), "C25229");
        Assert.assertEquals(findElement(By.id("pvCode-7")).getText(), "C25594,C48046,C13717");
        logout();
    }
    
}
