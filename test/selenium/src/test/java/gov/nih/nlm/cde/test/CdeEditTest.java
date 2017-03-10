package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

import static com.jayway.restassured.RestAssured.get;

public class CdeEditTest extends NlmCdeBaseTest {

    @Test
    public void editCde() {
        mustBeLoggedInAs(ctepCurator_username, password);
        String cdeName = "Mediastinal Lymph Node Physical Examination Specify";
        String cdeNameChange = "[name change number 1]";
        String cdeDefinitionChange = "[def change number 1]";
        goToCdeByName(cdeName);
        clickElement(By.id("naming_tab"));
        clickElement(By.cssSelector("#dd_name_0 i.fa-edit"));
        findElement(By.cssSelector("#dd_name_0 input")).sendKeys(cdeNameChange);
        clickElement(By.cssSelector("#dd_name_0 .fa-check"));
        clickElement(By.cssSelector("#dd_def_0 .fa-edit"));
        findElement(By.cssSelector("#dd_def_0 textarea")).sendKeys(cdeDefinitionChange);
        clickElement(By.cssSelector("#dd_def_0 .fa-check"));

        clickElement(By.id("pvs_tab"));
        clickElement(By.xpath("//*[@id = 'dd_uom']//i[contains(@class,'fa fa-edit')]"));
        findElement(By.xpath("//*[@id = 'dd_uom']//input")).sendKeys("myUom");
        clickElement(By.cssSelector("#dd_uom .fa-check"));
        textPresent("myUom");
        newCdeVersion("Change note for change number 1");

        goToCdeByName(cdeName);
        textPresent(cdeNameChange);
        textPresent(cdeDefinitionChange);

        clickElement(By.id("pvs_tab"));
        textPresent("myUom");


        clickElement(By.id("ids_tab"));
        Assert.assertEquals("1.1", findElement(By.id("dd_version_nlm")).getText());

        // Test history
        clickElement(By.id("history_tab"));
        textPresent(cdeName);
        textPresent("Change note for change number 1");
        selectHistoryAndCompare(1, 2);
        textPresent(cdeName + "[name change number 1]", By.xpath("//*[@id='historyCompareLeft_Naming_0_0']//div[@data-title='designation']"));
        textPresent(cdeDefinitionChange, By.xpath("//*[@id='historyCompareLeft_Naming_0_0']//div[@data-title='definition']"));

        // View Prior Version
        clickElement(By.xpath("//*[@id='prior-1']"));
        switchTab(1);
        textPresent("Warning: this data element is archived.");
        clickElement(By.linkText("view the current version here"));
        textPresent(cdeNameChange);
        textPresent(cdeDefinitionChange);

        clickElement(By.id("pvs_tab"));
        textPresent("myUom");

        openCdeAudit(cdeName);
        textPresent(cdeName + cdeNameChange);
        textPresent("the free text field to specify the other type of mediastinal lymph node dissection." + cdeDefinitionChange);

        switchTabAndClose(0);
    }

    @Test(dependsOnMethods = {"editCde"})
    public void modifiedSinceAPI() {
        String response = get(baseUrl + "/api/cde/modifiedElements?from=2016-01-01").asString();
        Assert.assertFalse(response.contains("Invalid"), "Actual: " + response);
        Assert.assertTrue(response.contains("64YoxVrtASF"), "Actual: " + response);
    }

}
