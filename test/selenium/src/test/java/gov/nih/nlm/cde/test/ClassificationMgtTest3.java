package gov.nih.nlm.cde.test;

import java.util.List;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebElement;
import org.testng.Assert;
import org.testng.annotations.Test;

public class ClassificationMgtTest3 extends BaseClassificationTest {
    
    @Test
    public void addDeleteClassificationMgt() {
        String org = "NINDS";
        mustBeLoggedInAs(ninds_username, password);
        gotoClassifMgt();
        createClassificationName(org, new String[]{"_a"});        
        createClassificationName(org, new String[]{"_a"});
        List<WebElement> linkList = driver.findElements(By.xpath("//span[text()=\"_a\"]"));
        Assert.assertTrue(linkList.size() == 1);
        createClassificationName(org, new String[]{"_a","_a_a"});        
        createClassificationName(org, new String[]{"_a","_a_a"});
        linkList = driver.findElements(By.xpath("//span[text()=\"_a_a\"]"));
        Assert.assertTrue(linkList.size() == 1);        
        createClassificationName(org, new String[]{"_a","_a_a","_a_a_a"});
        createClassificationName(org, new String[]{"_a","_a_b"});
        createClassificationName(org, new String[]{"_a","_a_c"});          
        deleteMgtClassification("classification-_a,_a_a", "_a_a");
        checkElementDoesNotExistByCSS("[id='okRemoveClassificationModal']");
        scrollToTop();
    }
    
    @Test
    public void renameClassification() {
        mustBeLoggedInAs(ninds_username, password);
        gotoClassifMgt();
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
        modalGone();
        hangon(5);
        findElement(By.id("classification-Disease,Spinal Cord Injuries,Classification"));
        findElement(By.id("classification-Disease,Spinal Cord Injuries,Classification,Supplemental"));
        findElement(By.xpath("//li[@id='classification-Disease,Spinal Cord Injuries,Classification']/div/div/a")).click();
        hangon(1);
        Assert.assertTrue(textPresent("Spinal Cord Injuries"));

        openClassificationAudit("NINDS > Disease > Spinal Cord Injury");
        textPresent("1236 elements");
        textPresent("Rename NINDS > Disease > Spinal Cord Injury to Spinal Cord Injuries");
    }
    
}
