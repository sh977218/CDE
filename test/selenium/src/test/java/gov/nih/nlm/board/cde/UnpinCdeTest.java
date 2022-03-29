package gov.nih.nlm.board.cde;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class UnpinCdeTest extends BoardTest {

    @Test
    public void unpinCde() {
        mustBeLoggedInAs(unpinUser, password);
        String cdeName = "Imaging volumetric result";
        goToBoard("Unpin Board");
        textPresent(cdeName);
        clickElement(By.id("unpin_0"));
        goToBoard("Unpin Board");
        textNotPresent(cdeName);
    }


}
