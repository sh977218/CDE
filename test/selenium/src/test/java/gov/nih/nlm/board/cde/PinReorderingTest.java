package gov.nih.nlm.board.cde;

import org.openqa.selenium.By;
import org.testng.annotations.Test;


public class PinReorderingTest extends BoardTest {

    String section = "board-cdes";


    @Test
    public void reorderPins() {
        mustBeLoggedInAs(classifyBoardUser_username, password);
        goToBoard("Test Pinning Board");
        textPresent("Medication affecting cardiovascular function type exam day indicator", By.id("linkToElt_0"));
        reorderBySection(section, "down", 0);
        closeAlert();
        textPresent("Ethnicity USA maternal category", By.id("linkToElt_0"));

        reorderBySection(section, "up", 1);
        closeAlert();
        textPresent("Medication affecting cardiovascular function type exam day indicator", By.id("linkToElt_0"));

        driver.navigate().refresh();

        textPresent("Ethnic Group Category Text", By.id("linkToElt_2"));
        reorderBySection(section, "top", 2);
        closeAlert();
        textPresent("Ethnic Group Category Text", By.id("linkToElt_0"));

        reorderBySection(section, "down", 0);
        closeAlert();
        textPresent("Ethnic Group Category Text", By.id("linkToElt_1"));

        reorderBySection(section, "down", 1);
        closeAlert();
        textPresent("Ethnic Group Category Text", By.id("linkToElt_2"));
        textPresent("Medication affecting cardiovascular function type exam day indicator", By.id("linkToElt_0"));

        textPresent("Walking ability status", By.id("linkToElt_19"));
        reorderBySection(section, "down", 19);
        checkAlert("Saved");
        textPresent("Urinary tract surgical procedure indicator", By.id("linkToElt_19"));

        paginatorNext();
        textPresent("Walking ability status", By.id("linkToElt_0"));
        reorderBySection(section, "top", 0);
        checkAlert("Saved");
        textPresent("Urinary tract surgical procedure indicator", By.id("linkToElt_0"));
        reorderBySection(section, "up", 0);
        checkAlert("Saved");
        textPresent("Brief Pain Inventory (BPI) - pain general activity interference scale", By.id("linkToElt_0"));

        paginatorPrevious();
        textPresent("Walking ability status", By.id("linkToElt_0"));
        textPresent("Urinary tract surgical procedure indicator", By.id("linkToElt_19"));
    }

}


