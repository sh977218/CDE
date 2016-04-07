package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.Test;

public class EditConceptsTest extends NlmCdeBaseTest {

    @Test
    public void editConcepts() {
        mustBeLoggedInAs(ctepCurator_username, password);
        String cdeName = "Patient Photograph Malignant Neoplasm Assessment Date";

        goToCdeByName(cdeName);
        showAllTabs();
        clickElement(By.id("concepts_tab"));

        clickElement(By.id("addConcept"));
        findElement(By.name("name")).sendKeys("DEC1");
        findElement(By.name("codeId")).sendKeys("DEC_CODE_111");
        clickElement(By.id("createConcept"));
//        hangon(2);
        clickElement(By.id("addConcept"));
        findElement(By.name("name")).sendKeys("OC1");
        findElement(By.name("codeId")).sendKeys("OC_CODE_111");
        new Select(driver.findElement(By.name("conceptType"))).selectByVisibleText("Class");
        clickElement(By.id("createConcept"));
//        hangon(2);

        clickElement(By.id("addConcept"));
        findElement(By.name("name")).sendKeys("Prop1");
        findElement(By.name("codeId")).sendKeys("Prop_CODE_111");
        new Select(driver.findElement(By.name("conceptType"))).selectByVisibleText("Property");
        clickElement(By.id("createConcept"));
//        hangon(2);

        newCdeVersion();

        goToCdeByName(cdeName);
        showAllTabs();
        clickElement(By.id("concepts_tab"));
        textPresent("DEC_CODE_111");
        textPresent("OC_CODE_111");
        textPresent("Prop_CODE_111");

        checkInHistory("Concepts", "", "DEC_CODE_111");
        checkInHistory("Concepts", "", "OC_CODE_111");
        checkInHistory("Concepts", "", "Prop_CODE_111");

        clickElement(By.id("concepts_tab"));
        clickElement(By.id("removedataElementConcept-0"));
        clickElement(By.id("removeobjectClass-1"));
        clickElement(By.id("removeproperty-3"));

        newCdeVersion();

        goToCdeByName(cdeName);
        Assert.assertTrue(!driver.findElement(By.cssSelector("BODY")).getText().contains("DEC1"));
        Assert.assertTrue(!driver.findElement(By.cssSelector("BODY")).getText().contains("OC1"));
        Assert.assertTrue(!driver.findElement(By.cssSelector("BODY")).getText().contains("PROP1"));

        showAllTabs();
        checkInHistory("Concepts", "DEC_CODE_111", "");
        checkInHistory("Concepts", "OC_CODE_111", "");
        checkInHistory("Concepts", "Prop_CODE_111", "");

        openCdeAudit(cdeName);
        textPresent("DEC_CODE_111");
        textPresent("OC_CODE_111");
        textPresent("Prop_CODE_111");
    }
}
