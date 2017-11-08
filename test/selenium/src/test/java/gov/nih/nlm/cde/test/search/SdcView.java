package gov.nih.nlm.cde.test.search;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class SdcView extends NlmCdeBaseTest {

    @Test
    public void sdcView() {
        String cdeName = "Anal Endoscopy Diagnostic Procedure Performed Other Specify Text";
        goToCdeByName(cdeName);
        clickElement(By.linkText("SDC View"));
        switchTab(1);
        textPresent(cdeName);
        Assert.assertTrue(findElement(By.id("scopedId")).getText().trim().startsWith("cde.nlm.nih.gov/"));
        Assert.assertEquals("1", findElement(By.id("version")).getText());
        Assert.assertEquals("Anal Endoscopy Diagnostic Procedure Performed Other Specify Text", findElement(By.id("name")).getText());
        Assert.assertEquals("Specify", findElement(By.id("prefQ")).getText());
        Assert.assertEquals(findElement(By.id("altQ")).getText(), "");
        Assert.assertEquals("The free text field used to describe the results of the anascopy.", findElement(By.id("def")).getText());
        Assert.assertEquals("Anal Endoscopy Diagnostic Procedure Performed", findElement(By.id("dec")).getText());
        Assert.assertEquals("DCP", findElement(By.id("ctx")).getText());
        Assert.assertEquals(findElement(By.id("adminStatus")).getText(), "");
        Assert.assertEquals("Qualified", findElement(By.id("regStatus")).getText());
        Assert.assertEquals(findElement(By.id("updated")).getText(), "");
        Assert.assertEquals(findElement(By.id("subOrg")).getText(), "");
        Assert.assertEquals(findElement(By.id("subOrgName")).getText(), "");
        Assert.assertEquals("DCP", findElement(By.id("stewOrg")).getText());
        Assert.assertEquals("DCP", findElement(By.id("stewOrgName")).getText());
        Assert.assertEquals("DCP:Division of Cancer Prevention", findElement(By.id("origin")).getText());
        Assert.assertEquals("Other Specify Text", findElement(By.id("vd")).getText());
        Assert.assertEquals("CHARACTER", findElement(By.id("datatype")).getText());
        Assert.assertEquals("described", findElement(By.id("type")).getText());
        switchTabAndClose(0);
    }

}
