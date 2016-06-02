package gov.nih.nlm.cde.test.boards;

import gov.nih.nlm.system.RecordVideo;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class UnpinTest extends BoardTest {
    @Test
    @RecordVideo
    public void unpin() {
        mustBeLoggedInAs(unpinUser, password);
        String cdeName = "Imaging volumetric result";
        goToBoard("Unpin Board");
        textPresent(cdeName);
        findElement(By.id("unpin_0")).click();
        goToBoard("Unpin Board");
        textNotPresent(cdeName);
    }
}
