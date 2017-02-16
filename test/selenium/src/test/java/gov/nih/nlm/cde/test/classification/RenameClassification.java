package gov.nih.nlm.cde.test.classification;

import gov.nih.nlm.cde.test.BaseClassificationTest;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebDriverException;
import org.testng.Assert;
import org.testng.annotations.Test;

public class RenameClassification extends BaseClassificationTest {

    @Test
    public void renameClassification() {
        mustBeLoggedInAs(ninds_username, password);
        gotoClassificationMgt();
        driver.findElement(By.xpath("//li[@id='classification-Disease,Spinal Cord Injury']/div/div/span/a[1]")).click();
        findElement(By.id("renameClassifInput")).clear();
        textPresent("Name is required");
        findElement(By.id("cancelRename")).click();
        modalGone();
        driver.findElement(By.xpath("//li[@id='classification-Disease,Spinal Cord Injury']/div/div/span/a[1]")).click();
        findElement(By.id("renameClassifInput")).sendKeys(Keys.BACK_SPACE);
        findElement(By.id("renameClassifInput")).sendKeys("ies;");
        textPresent("Classification Name cannot contain ;");
        findElement(By.id("renameClassifInput")).sendKeys(Keys.BACK_SPACE);
        findElement(By.xpath("//button[text()='Save']")).click();
        textPresent("Renaming in progress.");
        closeAlert();
        hangon(20);
        try {
            textPresent("Renaming complete.");
            closeAlert();
        } catch (WebDriverException e) {
            textPresent("Renaming complete.");
            closeAlert();
        }
        findElement(By.id("classification-Disease,Spinal Cord Injuries,Classification"));
        findElement(By.id("classification-Disease,Spinal Cord Injuries,Classification,Supplemental"));
        findElement(By.xpath("//li[@id='classification-Disease,Spinal Cord Injuries,Classification']/div/div/a")).click();
        textPresent("Spinal Cord Injuries");

        openClassificationAudit("NINDS > Disease > Spinal Cord Injury");
        textPresent("rename NINDS > Disease > Spinal Cord Injury to Spinal Cord Injuries");
        String body = findElement(By.cssSelector("body")).getText();
        Assert.assertTrue(body.contains("10+ elements") || body.contains("1281 elements"));
    }

}
