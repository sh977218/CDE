package gov.nih.nlm.common.test;

import org.openqa.selenium.By;
import org.testng.Assert;

public abstract class ConceptTest extends CommonTest {

    public void reorderConceptTest(String eltName) {
        mustBeLoggedInAs(testAdmin_username, password);
        goToEltByName(eltName, null);
        String tabName = "conceptsDiv";
        String prefix = "//div[@id='" + tabName + "']//div//*[@id='";
        String postfix = "']";

        clickElement(By.id("concepts_tab"));
        textPresent("Data Element");
        reorderIconTest(tabName);
        clickElement(By.xpath(prefix + "moveDown-0" + postfix));
        Assert.assertTrue(findElement(By.xpath(prefix + "concept_cde_name_1" + postfix)).getText().contains("cb1"));
        clickElement(By.xpath(prefix + "moveUp-2" + postfix));
        Assert.assertTrue(findElement(By.xpath(prefix + "concept_cde_name_1" + postfix)).getText().contains("cn3"));
        clickElement(By.xpath(prefix + "moveTop-2" + postfix));
        Assert.assertTrue(findElement(By.xpath(prefix + "concept_cde_name_0" + postfix)).getText().contains("cb1"));
    }
}
