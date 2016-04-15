package gov.nih.nlm.cde.test.boards;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class UnpinTest extends BoardTest {
    @Test
    public void unpin() {
        mustBeLoggedInAs(unpinUser, password);
        String cdeName = "Imaging volumetric result";
        goToCdeSearch();
        pinTo(cdeName, "Unpin Board");
        goToBoard("Unpin Board");
        textPresent(cdeName);
        findElement(By.id("unpin_0")).click();
        goToBoard("Unpin Board");
        textNotPresent(cdeName);

        removeBoard("Unpin Board");
    }
}
