
package gov.nih.nlm.cde.test.classification;

import gov.nih.nlm.cde.test.BaseClassificationTest;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.util.List;

public class ClassificationMgt2Test extends BaseClassificationTest {
    @Test
    public void reclassify() {
        String oldClassification = "OldClassification";
        String newClassification = "NewClassification";
        mustBeLoggedInAs(nlm_username, nlm_password);
        gotoClassificationMgt();
        textPresent("Clinical Trial Mgmt Systems");
        new Select(findElement(By.id("orgToManage"))).selectByVisibleText("org / or Org");
        textPresent("org / or Org", By.id("classMgt"));
        findElement(By.id("addClassification")).click();
        textPresent("Add Classification Under");
        findElement(By.id("addNewCatName")).sendKeys(oldClassification);
        clickElement(By.id("addNewCatButton"));
        closeAlert();
        textPresent(oldClassification);
        clickElement(By.id("addClassification"));
        textPresent("Add Classification Under");
        findElement(By.id("addNewCatName")).sendKeys(newClassification);
        clickElement(By.id("addNewCatButton"));
        closeAlert();
        textPresent(oldClassification);

        goToCdeByName("Gastrointestinal therapy water flush status");
        findElement(By.linkText("Classification")).click();
        textNotPresent(newClassification);
        findElement(By.id("addClassification")).click();
        textPresent("by recently added");
        findElement(By.id("selectClassificationOrg")).click();
        textPresent("org / or Org");
        new Select(findElement(By.id("selectClassificationOrg"))).selectByVisibleText("org / or Org");
        textPresent(oldClassification);
        textPresent(newClassification);
        findElement(By.xpath("//*[@id='addClassification-OldClassification']/button")).click();
        closeAlert();
        findElement(By.id("closeModal")).click();
        textNotPresent("by recently added");

        goToCdeByName("Gastrointestinal therapy feed tube other text");
        findElement(By.linkText("Classification")).click();
        textNotPresent(newClassification);
        findElement(By.id("addClassification")).click();
        textPresent("by recently added");
        findElement(By.id("selectClassificationOrg")).click();
        textPresent("org / or Org");
        new Select(findElement(By.id("selectClassificationOrg"))).selectByVisibleText("org / or Org");
        textPresent(oldClassification);
        textPresent(newClassification);
        findElement(By.xpath("//*[@id='addClassification-OldClassification']/button")).click();
        hangon(3);
        findElement(By.id("closeModal")).click();
        textNotPresent("by recently added");

        gotoClassificationMgt();
        new Select(findElement(By.id("orgToManage"))).selectByVisibleText("org / or Org");
        textPresent(oldClassification);
        textPresent(newClassification);
        findElement(By.xpath("//*[@id='classification-OldClassification-div']/div/div/span/a[@title='Reclassify']")).click();
        textPresent("Classify CDEs in Bulk");
        findElement(By.id("selectClassificationOrg")).click();
        textPresent("NINDS");
        new Select(findElement(By.id("selectClassificationOrg"))).selectByVisibleText("org / or Org");
        hangon(3);
        findElement(By.xpath("//*[@id='addClassification-NewClassification']/button")).click();
        hangon(3);
        findElement(By.id("closeModal")).click();

        mustBeLoggedInAs(nlm_username, nlm_password);
        findElement(By.id("username_link")).click();
        textPresent("Site Management");
        findElement(By.linkText("Audit")).click();
        textPresent("Remote Address");
        findElement(By.linkText("Classification Audit Log")).click();
        textPresent("2 elements org / or Org > NewClassification");
    }

    @Test
    public void checkReclassificationIcon() {
        mustBeLoggedInAs(ninds_username, password);

        // Check icons appear on classification management page
        gotoClassificationMgt();
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
