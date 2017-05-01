
package gov.nih.nlm.cde.test.classification;

import gov.nih.nlm.cde.test.BaseClassificationTest;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.util.List;

import static com.jayway.restassured.RestAssured.get;

public class ClassificationMgt2Test extends BaseClassificationTest {

    String oldClassification = "OldClassification";
    String newClassification = "NewClassification";

    private void addOldClassificationTo(String cdeName) {
        goToCdeByName(cdeName);
        clickElement(By.id("classification_tab"));
        textNotPresent(newClassification);
        clickElement(By.id("openClassificationModalBtn"));
        textPresent("By recently added");
        new Select(findElement(By.id("selectClassificationOrg"))).selectByVisibleText("org / or Org");
        textPresent(oldClassification);
        textPresent(newClassification);
        clickElement(By.id("OldClassification-classifyBtn"));
        closeAlert();
    }

    @Test
    public void reclassify() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        gotoClassificationMgt();
        textPresent("Clinical Trial Mgmt Systems");
        new Select(findElement(By.id("orgToManage"))).selectByVisibleText("org / or Org");
        textPresent("org / or Org", By.id("classMgt"));
        clickElement(By.id("addClassification"));
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
        textPresent(newClassification);

        addOldClassificationTo("Gastrointestinal therapy water flush status");
        addOldClassificationTo("Gastrointestinal therapy feed tube other text");

        gotoClassificationMgt();
        textPresent("COPPA");
        new Select(findElement(By.id("orgToManage"))).selectByVisibleText("org / or Org");
        textPresent(oldClassification);
        textPresent(newClassification);
        findElement(By.xpath("//*[@id='classification-OldClassification-div']/div/div/span/a[@title='Reclassify']")).click();
        textPresent("Classify CDEs in Bulk");
        clickElement(By.id("selectClassificationOrg"));
        textPresent("NINDS");
        new Select(findElement(By.id("selectClassificationOrg"))).selectByVisibleText("org / or Org");
        clickElement(By.xpath("//*[@id='addClassification-NewClassification']/button"));
        clickElement(By.id("closeModal"));


        goToCdeByName("Gastrointestinal therapy water flush status");
        clickElement(By.id("classification_tab"));
        textPresent(newClassification);
        textPresent(oldClassification);

        goToCdeByName("Gastrointestinal therapy feed tube other text");
        clickElement(By.id("classification_tab"));
        textPresent(newClassification);
        textPresent(oldClassification);

        clickElement(By.id("username_link"));
        textPresent("Site Management");
        clickElement(By.linkText("Audit"));
        textPresent("Remote Address");
        clickElement(By.linkText("Classification Audit Log"));
        textPresent("2 elements org / or Org > NewClassification");
    }

    @Test(dependsOnMethods = {"reclassify"})
    public void modifiedSinceAPI() {
        String response = get(baseUrl + "/api/cde/modifiedElements?from=2016-01-01").asString();
        Assert.assertFalse(response.contains("Invalid"), "Actual: " + response);
        Assert.assertTrue(response.contains("Z2hYKE_bwar"), "Actual: " + response);
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
        clickElement(By.id("classification_tab"));
        icons = driver.findElements(By.xpath("//i[not(contains(@class, 'ng-hide')) and contains(@class, 'fa-retweet')]"));
        Assert.assertTrue(icons.isEmpty());
    }
}
