package gov.nih.nlm.common.test;

import org.openqa.selenium.By;
import org.testng.Assert;

public abstract class ConceptTest extends CommonTest {

    public void reorderConceptTest(String eltName) {
        mustBeLoggedInAs(testAdmin_username, password);
        goToEltByName(eltName, null);
        clickElement(By.id("concepts_tab"));

        clickElement(By.xpath("//div[@id='moveDown-0']"));
        Assert.assertTrue(findElement(By.xpath("//div[@id='concept_cde_name_1']")).getText().contains("cb1"));
        clickElement(By.xpath("//div[@id='moveUp-2']"));
        Assert.assertTrue(findElement(By.xpath("//div[@id='concept_cde_name_1']")).getText().contains("cn3"));
        clickElement(By.xpath("//div[@id='moveTop-2']"));
        Assert.assertTrue(findElement(By.xpath("//div[@id='concept_cde_name_0']")).getText().contains("cb1"));
    }
}
