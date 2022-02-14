package gov.nih.nlm.board.cde;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class PinToBoardFilters extends NlmCdeBaseTest {

    @Test
    public void boardFilters() {
        mustBeLoggedInAs("tagBoardUser", password);

        goToCdeSearch();
        clickElement(By.id("browseOrg-CITN"));
        clickElement(By.id("pinToBoard_0"));

        textPresent("X-Ray Board");
        textPresent("Leukemia Board");
        textPresent("Epilepsy Board");

        clickElement(By.cssSelector("[data-id='tag-Disease']"));
        textNotPresent("X-Ray Board");
        textPresent("Leukemia Board");
        textPresent("Epilepsy Board");

        clickElement(By.cssSelector("[data-id='tag-Disease']"));
        textPresent("X-Ray Board");
        clickElement(By.cssSelector("[data-id='status-Private']"));
        textPresent("X-Ray Board");
        textNotPresent("Leukemia Board");
        textNotPresent("Epilepsy Board");

        textPresent("Device (1)");

        clickElement(By.xpath("//button[text()='Cancel']"));
    }

}
