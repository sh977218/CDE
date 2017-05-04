package gov.nih.nlm.cde.test.boards;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class UnpinTest extends BoardTest {
    @Test
    public void unpin() {
        mustBeLoggedInAs(unpinUser, password);
        String cdeName = "Imaging volumetric result";
        goToBoard("Unpin Board");
        textPresent(cdeName);
        clickElement(By.id("unpin_0"));
        goToBoard("Unpin Board");
        textNotPresent(cdeName);
    }
}
