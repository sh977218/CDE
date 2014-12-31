
package gov.nih.nlm.cde.test;

import static gov.nih.nlm.cde.test.NlmCdeBaseTest.ninds_username;
import java.util.List;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.testng.Assert;
import org.testng.annotations.Test;

public class ClassificationMgt2Test extends NlmCdeBaseTest {
    @Test
    public void reclassify() {
        mustBeLoggedInAs(ninds_username, password);
        gotoClassifMgt(); 
        createClassificationName(new String[]{"Classification Transfer"});
        closeAlert();
        createClassificationName(new String[]{"Classification Transfer","Child Classification"});
        closeAlert();
        findElement(By.xpath("//li[@id=\"classification-Disease,Duchenne Muscular Dystrophy/Becker Muscular Dystrophy\"]//a[contains(@class, 'classifyAll')]")).click();
        findElement(By.xpath("//div[@id='addClassificationModalBody']//span[text()='Classification Transfer']")).click();
        findElement(By.xpath("//div[@id='addClassification-Child Classification']//button")).click();
        hangon(2);
        textPresent("Elements classified");        
        goToCdeByName("Gastrointestinal therapy water flush status");
        findElement(By.linkText("Classification")).click();
        textPresent("NINDS");
        textPresent("Population");
        textPresent("Adult");
        goToCdeByName("Gastrointestinal therapy feed tube other text");
        findElement(By.linkText("Classification")).click();
        textPresent("NINDS");
        textPresent("Population");
        textPresent("Adult");        
    }
    
    @Test
    public void checkReclassificationIcon() {
        mustBeLoggedInAs(ninds_username, password);
        
        // Check icons appear on classification management page
        gotoClassifMgt();
        List<WebElement> icons = driver.findElements(By.xpath("//a[not(contains(@class, 'ng-hide')) and contains(@class, 'fa-retweet')]"));
        Assert.assertTrue(icons.size() > 1);
        
        // Check icons don't appear on CDE detail page
        String cdeName = "Brief Symptom Inventory-18 (BSI18)- Anxiety raw score";
        goToCdeByName(cdeName);
        findElement(By.linkText("Classification")).click();
        icons = driver.findElements(By.xpath("//a[not(contains(@class, 'ng-hide')) and contains(@class, 'fa-retweet')]"));
        Assert.assertTrue(icons.isEmpty());
    }    
}
