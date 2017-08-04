package gov.nih.nlm.cde.test.score;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class ReorderConceptTest extends NlmCdeBaseTest {
    @Test
    public void reorderConceptTest() {
        String cdeName = "cde for test cde reorder detail tabs";
        mustBeLoggedInAs(testAdmin_username, password);
        goToCdeByName(cdeName);
        clickElement(By.id("concepts_tab"));

        clickElement(By.id("moveDown-0"));
        Assert.assertTrue(findElement(By.id("concept_cde_name_1")).getText().contains("cb1"));
        clickElement(By.id("moveUp-2"));
        Assert.assertTrue(findElement(By.id("concept_cde_name_1")).getText().contains("cn3"));
        clickElement(By.id("moveTop-2"));
        Assert.assertTrue(findElement(By.id("concept_cde_name_0")).getText().contains("cb1"));
    }
}
