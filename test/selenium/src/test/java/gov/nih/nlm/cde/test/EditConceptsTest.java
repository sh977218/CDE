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
        String cdeName = "Patient Photograph Malignant";

        goToCdeByName(cdeName);
        findElement(By.linkText("Concepts")).click();

        findElement(By.id("addConcept")).click();
        findElement(By.name("name")).sendKeys("DEC1");
        findElement(By.name("codeId")).sendKeys("DEC_CODE_111");
        findElement(By.id("createConcept")).click();
        hangon(2);
        waitAndClick(By.id("addConcept"));
        findElement(By.name("name")).sendKeys("OC1");
        findElement(By.name("codeId")).sendKeys("OC_CODE_111");
        new Select(driver.findElement(By.name("conceptType"))).selectByVisibleText("Class");
        findElement(By.id("createConcept")).click();
        hangon(2);

        findElement(By.id("addConcept")).click();
        findElement(By.name("name")).sendKeys("Prop1");
        findElement(By.name("codeId")).sendKeys("Prop_CODE_111");
        new Select(driver.findElement(By.name("conceptType"))).selectByVisibleText("Property");
        findElement(By.id("createConcept")).click();
        hangon(2);

        newCdeVersion();

        goToCdeByName(cdeName);
        findElement(By.linkText("Concepts")).click();
        Assert.assertTrue(textPresent("DEC_CODE_111"));
        Assert.assertTrue(textPresent("OC_CODE_111"));
        Assert.assertTrue(textPresent("Prop_CODE_111"));

        checkInHistory("Concepts", "", "DEC_CODE_111");
        checkInHistory("Concepts", "", "OC_CODE_111");
        checkInHistory("Concepts", "", "Prop_CODE_111");

        findElement(By.linkText("Concepts")).click();

        findElement(By.id("decConceptRemove-0")).click();
        findElement(By.id("ocConceptRemove-1")).click();
        findElement(By.id("propConceptRemove-3")).click();

        newCdeVersion();

        goToCdeByName(cdeName);
        Assert.assertTrue(!driver.findElement(By.cssSelector("BODY")).getText().contains("DEC1"));
        Assert.assertTrue(!driver.findElement(By.cssSelector("BODY")).getText().contains("OC1"));
        Assert.assertTrue(!driver.findElement(By.cssSelector("BODY")).getText().contains("PROP1"));

        checkInHistory("Concepts", "DEC_CODE_111", "");
        checkInHistory("Concepts", "OC_CODE_111", "");
        checkInHistory("Concepts", "Prop_CODE_111", "");

        openCdeAudit(cdeName);
        textPresent("DEC_CODE_111");
        textPresent("OC_CODE_111");
        textPresent("Prop_CODE_111");
    }
}
