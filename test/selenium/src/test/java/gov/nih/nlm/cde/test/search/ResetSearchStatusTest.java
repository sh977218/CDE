package gov.nih.nlm.cde.test.search;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.util.List;
import java.util.ArrayList;

public class ResetSearchStatusTest extends NlmCdeBaseTest {
    @Test
    public void resetSearchStatus() {
        goToCdeSearch();
        findElement(By.id("browseOrg-caBIG")).click();

        findElement(By.id("menu_cdes_link")).click();
        textPresent("Browse by organization");
    }
}
