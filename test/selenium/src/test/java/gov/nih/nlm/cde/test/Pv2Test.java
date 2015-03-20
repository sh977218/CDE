package gov.nih.nlm.cde.test;

import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.Assert;
import org.testng.annotations.Test;

public class Pv2Test extends NlmCdeBaseTest {

    @Test
    public void addPv() {
        String cdeName = "Surgical Procedure Hand Laparoscopic Port Anatomic Site";
        mustBeLoggedInAs(ctepCurator_username, password);
        goToCdeByName(cdeName);
        findElement(By.linkText("Permissible Values")).click();
        textPresent("Right Middle Abdomen");
        findElement(By.id("pvRemove-8")).click();
        findElement(By.id("addPv")).click();
        findElement(By.xpath("//td[@id='pv-10']//i")).click();
        findElement(By.xpath("//td[@id='pv-10']//input")).clear();
        findElement(By.xpath("//td[@id='pv-10']//input")).sendKeys("New PV");
        findElement(By.cssSelector("#pv-10 .fa-check")).click();

        findElement(By.xpath("//td[@id='pvCodeSystem-10']//div[@typeahead-source='pVTypeaheadCodeSystemNameList']//i[@class='fa fa-edit']")).click();
        textPresent("Confirm");
        findElement(By.xpath("//td[@id='pvCodeSystem-10']//input")).sendKeys("N");
        textPresent("NCI Thesaurus");
        newCdeVersion();
        textPresent("Qualified");
        goToCdeByName(cdeName);
        findElement(By.linkText("Permissible Values")).click();
        textPresent("New PV");
        Assert.assertEquals(driver.findElement(By.cssSelector("BODY")).getText().indexOf("Right Middle Abdomen"), -1);

        checkInHistory("Permissible Values", "", "Right Middle Abdomen");
    }

    @Test
    public void reOrderPv() {
        mustBeLoggedInAs(ctepCurator_username, password);
        goToCdeByName("Involved Organ Laterality Type");
        findElement(By.linkText("Permissible Values")).click();
        wait.until(ExpectedConditions.textToBePresentInElementLocated(By.id("pvCode-2"), "C25229"));
        Assert.assertEquals(findElement(By.id("pvCode-6")).getText(), "C25594,C48046,C13717");
        findElement(By.id("pvUp-2")).click();
        findElement(By.id("pvDown-6")).click();
        newCdeVersion("Reordered PV");
        findElement(By.linkText("Permissible Values")).click();
        Assert.assertEquals(findElement(By.id("pvCode-1")).getText(), "C25229");
        Assert.assertEquals(findElement(By.id("pvCode-7")).getText(), "C25594,C48046,C13717");

        checkInHistory("Permissible Values", "C25229", "C25594,C48046,C13717");
        checkInHistory("Permissible Values", "C25594,C48046,C13717", "C25229");
    }
}
