package gov.nih.nlm.common.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;

public abstract class ConceptTest extends NlmCdeBaseTest {

    public void reorderConceptTest(String eltName) {
        mustBeLoggedInAs(testAdmin_username, password);
        goToCdeByName(eltName);
        goToConcepts();

        clickElement(By.id("moveDown-0"));
        Assert.assertTrue(findElement(By.id("concept_cde_name_1")).getText().contains("cb1"));
        clickElement(By.id("moveUp-2"));
        Assert.assertTrue(findElement(By.id("concept_cde_name_1")).getText().contains("cn3"));
        clickElement(By.id("moveTop-2"));
        Assert.assertTrue(findElement(By.id("concept_cde_name_0")).getText().contains("cb1"));
    }
}
