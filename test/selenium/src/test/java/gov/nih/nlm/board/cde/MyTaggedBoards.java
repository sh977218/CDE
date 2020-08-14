package gov.nih.nlm.board.cde;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class MyTaggedBoards extends BoardTest {

    @Test
    public void taggedMyBoards() {
        mustBeLoggedInAs("tagBoardUser", password);
        gotoMyBoards();
        textPresent("X-Ray Board");
        textPresent("Leukemia Board");
        textPresent("Epilepsy Board");

        clickElement(By.xpath("//label[contains(.,'cde')]"));
        clickElement(By.id("tag-Disease"));
        textNotPresent("X-Ray Board");
        textPresent("Leukemia Board");
        textPresent("Epilepsy Board");

        clickElement(By.id("tag-Disease"));
        textPresent("X-Ray Board");
        clickElement(By.id("ss-Private"));
        textPresent("X-Ray Board");
        textNotPresent("Leukemia Board");
        textNotPresent("Epilepsy Board");

        textPresent("Device (1)");
    }

}
