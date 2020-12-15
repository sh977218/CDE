package gov.nih.nlm.cde.test.score;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class ReorderConceptTest extends NlmCdeBaseTest {
    @Test
    public void reorderConceptTest() {
        String cdeName = "Reorder concept cde";
        mustBeLoggedInAs(testAdmin_username, password);
        goToCdeByName(cdeName);
        goToConcepts();

        reorderBySection("concepts","down",0);
        Assert.assertTrue(findElement(By.id("concept_cde_name_1")).getText().contains("cb1"));
        reorderBySection("concepts","up",2);
        Assert.assertTrue(findElement(By.id("concept_cde_name_1")).getText().contains("cn3"));
        reorderBySection("concepts","top",2);
        Assert.assertTrue(findElement(By.id("concept_cde_name_0")).getText().contains("cb1"));
    }
}
