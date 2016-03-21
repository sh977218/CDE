package gov.nih.nlm.cde.test.valueDomain;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class AddPvTest extends NlmCdeBaseTest {
    private PvValidatorTest pvValidator = new PvValidatorTest();

    @Test
    public void addPv() {
        String cdeName = "Surgical Procedure Hand Laparoscopic Port Anatomic Site";
        mustBeLoggedInAs(ctepCurator_username, password);
        goToCdeByName(cdeName);
        clickElement(By.id("pvs_tab"));
        textPresent("Right Middle Abdomen");
        clickElement(By.id("pvRemove-8"));
        pvValidator.addPv("New PV");
        clickElement(By.xpath("//td[@id='pvCodeSystem-10']//div[@typeahead-source='pVTypeaheadCodeSystemNameList']//i[@class='fa fa-edit']"));
        textPresent("Confirm");
        findElement(By.xpath("//td[@id='pvCodeSystem-10']//input")).sendKeys("N");
        textPresent("NCI Thesaurus");
        newCdeVersion();
        goToCdeByName(cdeName);
        clickElement(By.id("pvs_tab"));
        textPresent("New PV");
        Assert.assertEquals(driver.findElement(By.cssSelector("BODY")).getText().indexOf("Right Middle Abdomen"), -1);

        showAllTabs();
        checkInHistory("Permissible Values", "", "Right Middle Abdomen");
    }

}

