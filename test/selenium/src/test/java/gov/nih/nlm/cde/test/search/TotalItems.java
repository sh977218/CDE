package gov.nih.nlm.cde.test.search;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class TotalItems extends NlmCdeBaseTest {

    @Test
    public void totalItems() {
        goToCdeSearch();
        textPresent("elements across");
        Assert.assertTrue(Integer.parseInt(findElement(By.id("totalItems")).getText()) > 11000);

        goToFormSearch();;
        textPresent("elements across");
        Assert.assertTrue(Integer.parseInt(findElement(By.id("totalItems")).getText()) > 800);

    }

}
