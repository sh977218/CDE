package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class Pv2Test extends NlmCdeBaseTest {
    private PvValidatorTest pvValidator = new PvValidatorTest();

    @Test
    public void addPv() {
        String cdeName = "Surgical Procedure Hand Laparoscopic Port Anatomic Site";
        mustBeLoggedInAs(ctepCurator_username, password);
        goToCdeByName(cdeName);
        findElement(By.linkText("Permissible Values")).click();
        textPresent("Right Middle Abdomen");
        findElement(By.id("pvRemove-8")).click();
        pvValidator.addPv(10, "New PV");
        findElement(By.xpath("//td[@id='pvCodeSystem-10']//div[@typeahead-source='pVTypeaheadCodeSystemNameList']//i[@class='fa fa-edit']")).click();
        textPresent("Confirm");
        findElement(By.xpath("//td[@id='pvCodeSystem-10']//input")).sendKeys("N");
        textPresent("NCI Thesaurus");
        newCdeVersion();
        goToCdeByName(cdeName);
        findElement(By.linkText("Permissible Values")).click();
        textPresent("New PV");
        Assert.assertEquals(driver.findElement(By.cssSelector("BODY")).getText().indexOf("Right Middle Abdomen"), -1);

        checkInHistory("Permissible Values", "", "Right Middle Abdomen");
    }

}

