package gov.nih.nlm.cde.test.permissibleValue;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.Assert;
import org.testng.annotations.Test;

public class NbOfPvInSearchTest extends NlmCdeBaseTest {

    @Test
    public void nbOfPVsInSearch() {
        mustBeLoggedOut();
        openCdeInList("country ISO");
        textPresent("(249 total)");
        clickElement(By.id("list_gridView"));
        textPresent("Nb of PVs");
        Assert.assertEquals(findElement(By.cssSelector("td.nbOfPVs")).getText(), "249");
        findElement(By.id("searchSettings")).click();
        textPresent("Number of Permissible Values (PVs)");
        wait.until(ExpectedConditions.elementSelectionStateToBe(By.id("nbOfPVs"), true));
        findElement(By.id("nbOfPVs")).click();
        wait.until(ExpectedConditions.elementSelectionStateToBe(By.id("nbOfPVs"), false));
        clickElement(By.id("saveSettings"));
        textPresent("Settings saved!");
        textNotPresent("249");
    }

}
