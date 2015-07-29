package gov.nih.nlm.cde.test;

import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.Test;

public class CopyCdeTest extends BaseClassificationTest {

    @Test
    public void copyCde() {
        mustBeLoggedInAs(ninds_username, password);
        goToCdeByName("Medication affecting cardiovascular function type exam day indicator");
        findElement(By.linkText("Forks")).click();
        findElement(By.id("openCdeCopyModal")).click();
        textPresent("Please select at least one classification");
        Assert.assertFalse(findElement(By.id("saveCopy")).isEnabled());
        addClassificationToNewCdeMethod(new String[]{"NINDS", "Population", "Adult"});
        findElement(By.id("saveCopy")).click();
        hangon(1);
        textPresent("Incomplete", By.id("dd_status"));
        textPresent("Copy of: Medication affecting cardiovascular function type exam day indicator", By.id("nameEdit"));
    }

}
