package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.*;
import org.testng.Assert;
import org.testng.annotations.Test;

public class SearchSettingsTest extends NlmCdeBaseTest {
    @Test
    void UnloggedUserSetsFields (){
        goToSearch("cde");
        textNotPresent("Other Names");
        textNotPresent("Permissible Values");
        textNotPresent("Steward");
        textNotPresent("Used by Organizations");
        textNotPresent("Registration Status");
        textNotPresent("Admin Status");
        textNotPresent("Identifiers");

        findElement(By.id("gridView")).click();
        textPresent("Other Names");
        textPresent("Permissible Values");
        textPresent("Steward");
        textPresent("Used by Organizations");
        textPresent("Registration Status");
        textPresent("Admin Status");
        textPresent("Identifiers");

        findElement(By.id("searchSettings")).click();
        textPresent("Search Results View");
        textPresent("Table View Fields");
        textPresent("Search Results View");
        findElement(By.id("registrationStatus")).click();
        findElement(By.id("administrativeStatus")).click();
        findElement(By.id("saveSettings")).click();

        goToSearch("cde");
        findElement(By.id("gridView")).click();
        textPresent("Other Names");
        textPresent("Permissible Values");
        textPresent("Steward");
        textPresent("Used by Organizations");
        textNotPresent("Registration Status");
        textNotPresent("Admin Status");
        textPresent("Identifiers");
    }
}
