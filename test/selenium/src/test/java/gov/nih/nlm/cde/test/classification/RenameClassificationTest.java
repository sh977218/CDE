package gov.nih.nlm.cde.test.classification;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebDriverException;
import org.testng.Assert;
import org.testng.annotations.Test;

public class RenameClassificationTest extends NlmCdeBaseTest {

    @Test
    public void renameClassification() {
        mustBeLoggedInAs(ninds_username, password);
        gotoClassificationMgt();
        clickElement(By.xpath(getOrgClassificationIconXpath("rename", new String[]{"Disease", "Spinal Cord Injury"})));
        findElement(By.id("renameClassifInput")).clear();
        textPresent("Name is required");
        clickElement(By.id("cancelRename"));
        modalGone();
        clickElement(By.xpath("//li[@id='classification-Disease,Spinal Cord Injury']/div/div/span/a[1]"));
        findElement(By.id("renameClassifInput")).sendKeys(Keys.BACK_SPACE);
        findElement(By.id("renameClassifInput")).sendKeys("ies;");
        textPresent("Classification Name cannot contain ;");
        findElement(By.id("renameClassifInput")).sendKeys(Keys.BACK_SPACE);
        clickElement(By.xpath("//button[text()='Save']"));
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
        findElement(By.xpath("//*[@id='classification-Disease,Spinal Cord Injuries,Classification']"));
        findElement(By.xpath("//*[@id='classification-Disease,Spinal Cord Injuries,Classification,Supplemental']"));
        clickElement(By.xpath("//li[@id='classification-Disease,Spinal Cord Injuries,Classification']/div/div/a"));
        textPresent("Spinal Cord Injuries");

        openClassificationAudit("NINDS > Disease > Spinal Cord Injury");
        textPresent("rename NINDS > Disease > Spinal Cord Injury to Spinal Cord Injuries");
        String body = findElement(By.cssSelector("body")).getText();
        Assert.assertTrue(body.contains("10+ elements") || body.contains("1281 elements"));
    }

}
