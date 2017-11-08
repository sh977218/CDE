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
        Assert.assertTrue(findElement(By.id("dd_scopedId")).getText().trim().startsWith("cde.nlm.nih.gov/"));
        Assert.assertEquals("1", findElement(By.id("dd_version")).getText());
        Assert.assertEquals("Anal Endoscopy Diagnostic Procedure Performed Other Specify Text", findElement(By.id("dd_name")).getText());
        Assert.assertEquals("Specify", findElement(By.id("dd_prefQ")).getText());
        Assert.assertEquals(findElement(By.id("dd_altQ")).getText(), "");
        Assert.assertEquals("The free text field used to describe the results of the anascopy.", findElement(By.id("dd_def")).getText());
        Assert.assertEquals("Anal Endoscopy Diagnostic Procedure Performed", findElement(By.id("dd_dec")).getText());
        Assert.assertEquals("DCP", findElement(By.id("dd_ctx")).getText());
        Assert.assertEquals(findElement(By.id("dd_adminStatus")).getText(), "");
        Assert.assertEquals("Qualified", findElement(By.id("dd_regStatus")).getText());
        Assert.assertEquals(findElement(By.id("updated")).getText(), "");
        Assert.assertEquals(findElement(By.id("dd_subOrg")).getText(), "");
        Assert.assertEquals(findElement(By.id("dd_subOrgName")).getText(), "");
        Assert.assertEquals("DCP", findElement(By.id("dd_stewOrg")).getText());
        Assert.assertEquals("DCP", findElement(By.id("dd_stewOrgName")).getText());
        Assert.assertEquals("DCP:Division of Cancer Prevention", findElement(By.id("dd_origin")).getText());
        Assert.assertEquals("Other Specify Text", findElement(By.id("dd_vd")).getText());
        Assert.assertEquals("CHARACTER", findElement(By.id("dd_datatype")).getText());
        Assert.assertEquals("described", findElement(By.id("dd_type")).getText());
        switchTabAndClose(0);
    }

}
