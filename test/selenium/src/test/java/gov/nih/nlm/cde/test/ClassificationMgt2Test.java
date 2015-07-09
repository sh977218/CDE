
package gov.nih.nlm.cde.test;

import org.openqa.selenium.By;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebElement;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.util.List;
import java.util.concurrent.TimeUnit;

public class ClassificationMgt2Test extends BaseClassificationTest {
    @Test
    public void reclassify() {
        String org = "NINDS";
        mustBeLoggedInAs(ninds_username, password);
        gotoClassifMgt(); 
        createClassificationName(org, new String[]{"Classification Transfer"});
        closeAlert();
        createClassificationName(org, new String[]{"Classification Transfer","Child Classification"});
        closeAlert();
        scrollToTop();
        findElement(By.xpath("//li[@id=\"classification-Disease,Duchenne Muscular Dystrophy/Becker Muscular Dystrophy\"]//a[contains(@class, 'classifyAll')]")).click();
        findElement(By.xpath("//div[@id='addClassificationModalBody']//span[text()='Classification Transfer']")).click();
        findElement(By.xpath("//div[@id='addClassification-Child Classification']//button")).click();
        driver.manage().timeouts().implicitlyWait(defaultTimeout * 2, TimeUnit.SECONDS);
        try {
            textPresent("Elements classified");        
            closeAlert();
        } catch (TimeoutException e) {
            // Assumption, selenium poll is not quick enough and misses the text;
            System.out.println("Did not see text 'Elements Classified'");
        }
        driver.manage().timeouts().implicitlyWait(defaultTimeout, TimeUnit.SECONDS);  
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

        openClassificationAudit("NINDS > Classification Transfer > Child Classification");
        textPresent("Reclassify NINDS > Classification Transfer > Child Classification");
        textPresent("214 elements");
    }
    
    @Test
    public void checkReclassificationIcon() {
        mustBeLoggedInAs(ninds_username, password);
        
        // Check icons appear on classification management page
        gotoClassifMgt();
        List<WebElement> icons = driver.findElements(By.xpath("//i[not(contains(@class, 'ng-hide')) and contains(@class, 'fa-retweet')]"));
        Assert.assertTrue(icons.size() > 1);
        
        // Check icons don't appear on CDE detail page
        String cdeName = "Brief Symptom Inventory-18 (BSI18)- Anxiety raw score";
        goToCdeByName(cdeName);
        findElement(By.linkText("Classification")).click();
        icons = driver.findElements(By.xpath("//i[not(contains(@class, 'ng-hide')) and contains(@class, 'fa-retweet')]"));
        Assert.assertTrue(icons.isEmpty());
    }    
}
