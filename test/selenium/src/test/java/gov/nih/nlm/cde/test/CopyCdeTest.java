package gov.nih.nlm.cde.test;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class CopyCdeTest extends BaseClassificationTest {

    @Test
    public void copyCde() {
        String cdeName = "Medication affecting cardiovascular function type exam day indicator";
        mustBeLoggedInAs(ninds_username, password);
        goToCdeByName(cdeName);
        clickElement(By.id("copyCdeBtn"));
        textPresent("Create a copy");
        textPresent("The International SCI Data Sets");
        clickElement(By.id("submit"));
        hangon(1);
        textPresent("Incomplete", By.cssSelector("[itemprop='registrationStatus']"));
        textPresent("Copy of: Medication affecting cardiovascular function type exam day indicator", By.cssSelector("[itemprop='name']"));
        textPresent("Copy of: xug6J6R8fkf");
    }

}
