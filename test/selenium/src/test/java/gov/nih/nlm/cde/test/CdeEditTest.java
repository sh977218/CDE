package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

import static com.jayway.restassured.RestAssured.get;

@Test(groups="CdeEditTest")
public class CdeEditTest extends NlmCdeBaseTest {

    @Test
    public void editCde() {
        mustBeLoggedInAs(ctepCurator_username, password);
        String cdeName = "Mediastinal Lymph Node Physical Examination Specify";
        goToCdeByName(cdeName);
        clickElement(By.cssSelector("i.fa-edit"));
        findElement(By.xpath("//div[@id='nameEdit']//input")).sendKeys("[name change number 1]");
        clickElement(By.cssSelector(".fa-check"));
        clickElement(By.xpath("//*[@id = 'dd_def']//i[contains(@class,'fa fa-edit')]"));
        findElement(By.xpath("//div/div[2]/textarea")).sendKeys("[def change number 1]");
        clickElement(By.xpath("//*[@id='dd_def']//button[contains(@class,'fa fa-check')]"));
        clickElement(By.xpath("//*[@id = 'dd_uom']//i[contains(@class,'fa fa-edit')]"));
        findElement(By.xpath("//*[@id = 'dd_uom']//input")).sendKeys("myUom");
        clickElement(By.cssSelector("#dd_uom .fa-check"));
        textPresent("myUom");
        newCdeVersion("Change note for change number 1");
        goToCdeByName(cdeName);
        textPresent("[name change number 1]");
        textPresent("[def change number 1]");
        textPresent("myUom");
        // test that label and its value are aligned. 
        Assert.assertEquals(findElement(By.id("dt_updated")).getLocation().y, findElement(By.id("dd_updated")).getLocation().y);

        showAllTabs();
        clickElement(By.id("ids_tab"));
        Assert.assertEquals("1.1", findElement(By.id("dd_version_nlm")).getText());

        // Test history
        clickElement(By.id("history_tab"));
        textPresent(cdeName);
        textPresent("Change note for change number 1");
        hangon(1);
        showHistoryDiff(0);
        textPresent(cdeName + "[name change number 1]");
        textPresent("the free text field to specify the other type of mediastinal lymph node dissection.[def change number 1]");

        confirmCdeModification("Primary Name", cdeName, cdeName + "[name change number 1]");
        confirmCdeModification("Primary Definition", "the free text field to specify the other type of mediastinal lymph node dissection.", "the free text field to specify the other type of mediastinal lymph node dissection.[def change number 1]");


        // View Prior Version
        clickElement(By.id("history_tab"));
        showHistoryFull(1);
        textPresent("1");
        textPresent("Warning: this data element is archived.");

        clickElement(By.linkText("view the current version here"));
        textPresent("[name change number 1]");
        textPresent("[def change number 1]");
        textPresent("myUom");

        openCdeAudit(cdeName);
        textPresent(cdeName + "[name change number 1]");
        textPresent("the free text field to specify the other type of mediastinal lymph node dissection.[def change number 1]");


    }

    @Test(dependsOnMethods = {"editCde"})
    public void modifiedSinceAPI() {
        String response = get(baseUrl + "/api/cde/modifiedElements?from=2016-01-01").asString();
        Assert.assertFalse(response.contains("Invalid"));
        System.out.println(response);
        Assert.assertTrue(response.contains("64YoxVrtASF"));
    }

    @Test
    public void doNotSaveIfPendingChanges() {
        mustBeLoggedInAs(ctepCurator_username, password);
        String cdeName = "ATRA Agent Current Report Period Administered Ind-2";
        goToCdeByName(cdeName);
        clickElement(By.cssSelector("i.fa-edit"));
        findElement(By.xpath("//div[@id='nameEdit']//input")).sendKeys("[name change number 1]");
        clickElement(By.cssSelector(".fa-check"));
        clickElement(By.linkText("Classification"));

        Assert.assertFalse(findElement(By.id("addClassification")).isEnabled());
        showAllTabs();
        clickElement(By.id("properties_tab"));
        clickElement(By.id("addProperty"));
        findElement(By.name("key")).sendKeys("MyKey2");
        findElement(By.name("value")).sendKeys("MyValue2");
        clickElement(By.id("createProperty"));
        Assert.assertTrue(textPresent("Property added. Save to confirm."));
        closeAlert();
        modalGone();
        clickElement(By.id("removeProperty-0"));
        clickElement(By.id("confirmRemoveProperty-0"));
        Assert.assertTrue(textPresent("Property removed. Save to confirm."));
        closeAlert();

        clickElement(By.linkText("Identifiers"));
        clickElement(By.id("addId"));
        findElement(By.name("source")).sendKeys("MyOrigin1");
        findElement(By.name("id")).sendKeys("MyId1");
        findElement(By.name("version")).sendKeys("MyVersion1");
        clickElement(By.id("createId"));
        Assert.assertTrue(textPresent("Identifier added. Save to confirm."));
        modalGone();
        closeAlert();
        clickElement(By.id("removeId-1"));
        clickElement(By.id("confirmRemoveId-1"));
        Assert.assertTrue(textPresent("Identifier removed. Save to confirm."));
    }


}
