package gov.nih.nlm.cde.test.valueDomain;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class NbOfPvInSearchTest extends NlmCdeBaseTest {

    @Test
    public void nbOfPVsInSearch() {
        mustBeLoggedOut();
        openCdeInList("country ISO");
        textPresent("(249 total)");
        clickElement(By.id("gridView"));
        textPresent("Nb of PVs");
        Assert.assertEquals(findElement(By.cssSelector("td.nbOfPVs")).getText(), "249");
        findElement(By.id("searchSettings")).click();
        textPresent("Number of Permissible Values (PVs)");
        findElement(By.id("nbOfPVs")).click();
        Assert.assertFalse(findElement(By.id("nbOfPVs")).isSelected());
        clickElement(By.id("saveSettings"));
        textPresent("Settings saved!");
        textNotPresent("249");
    }

}
