package gov.nih.nlm.cde.test;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class CopyCdeTest extends BaseClassificationTest {

    @Test
    public void copyCde() {
        mustBeLoggedInAs(ninds_username, password);
        String cdeName = "Medication affecting cardiovascular function type exam day indicator";
        goToCdeByName(cdeName);
        clickElement(By.id("copyCdeBtn"));
        textPresent("Create a copy");
        textPresent("The International SCI Data Sets");
        clickElement(By.id("saveCopy"));
        hangon(1);
        textPresent("Incomplete", By.id("registrationStatus"));
        textPresent("Copy of: Medication affecting cardiovascular function type exam day indicator", By.id("dd_general_name"));
        clickElement(By.id("status_tab"));
        textPresent("Copy of: xug6J6R8fkf");
    }

}
