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
        clickElement(By.id("tableViewSettings"));
        textPresent("Number of Permissible Values (PVs)");
        clickElement(By.id("nbOfPVs"));
        closeTableViewPreferenceModal();
        textNotPresent("249");
    }

}
