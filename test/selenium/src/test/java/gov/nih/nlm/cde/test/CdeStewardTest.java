package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.Test;

public class CdeStewardTest extends NlmCdeBaseTest {
    
    @Test
    public void changeCDESteward() {
        mustBeLoggedInAs(classificationMgtUser_username, password);
        String cdeName = "Patient Tissue Specimen Colorectal Research Consent Ind-2";

        goToCdeByName(cdeName);
        
        // Changes Steward and cancels
        findElement(By.id("dd_edit_steward")).click();
        new Select(findElement(By.id("elt.stewardOrg.name"))).selectByVisibleText("NINDS");
        findElement(By.id("elt.stewardOrg.name.cancel")).click();
        textPresent("CTEP");
        
        // Changes Steward and save
        findElement(By.id("dd_edit_steward")).click();
        new Select(findElement(By.id("elt.stewardOrg.name"))).selectByVisibleText("NINDS");
        findElement(By.id("elt.stewardOrg.name.ok")).click();
        Assert.assertTrue(textPresent("NINDS"));
        newCdeVersion();
        Assert.assertEquals("NINDS", findElement(By.id("dd_general_steward")).getText());
        checkInHistory("Steward", "CTEP", "NINDS");
    }
    
    @Test
    public void checkStewardOrgDetails() {
        mustBeLoggedInAs(classificationMgtUser_username, password);
        goToCdeByName("MFLIE Hardship 24 Hour Nausea Personal Affect 7 Point Likert Scale", "Candidate");
        hangon(1);
        hoverOverElement(findElement(By.linkText("caBIG")));
        checkTooltipText(By.linkText("caBIG"), "Organization Details");
        checkTooltipText(By.linkText("caBIG"), "Cancer Biomedical Informatics Grid");
        checkTooltipText(By.linkText("caBIG"), "123 Somewhere On Earth, Abc, Def, 20001");
        checkTooltipText(By.linkText("caBIG"), "caBig@nih.gov");
        checkTooltipText(By.linkText("caBIG"), "111-222-3333");
        checkTooltipText(By.linkText("caBIG"), "https://cabig.nci.nih.gov/");
        
        // Changes Steward and save
        findElement(By.id("dd_edit_steward")).click();
        new Select(findElement(By.id("elt.stewardOrg.name"))).selectByVisibleText("CTEP");
        hangon(.5);
        findElement(By.id("elt.stewardOrg.name.ok")).click();
        textPresent("CTEP");
        newCdeVersion();

        goToCdeByName("MFLIE Hardship 24 Hour Nausea Personal Affect 7 Point Likert Scale", "Candidate");
        Assert.assertEquals("CTEP", findElement(By.id("dd_general_steward")).getText());
        hangon(1);
        
        hoverOverElement(findElement(By.linkText("CTEP")));
        checkTooltipText(By.linkText("CTEP"), "Organization Details");
        checkTooltipText(By.linkText("CTEP"), "Cancer Therapy Evaluation Program");
        checkTooltipText(By.linkText("CTEP"), "Cancer Biomedical Informatics Grid");
        checkTooltipText(By.linkText("CTEP"), "75 Sunshine Street, Blah, Doh 12345");
        checkTooltipText(By.linkText("CTEP"), "https://cabig.nci.nih.gov/");
    }

    private void checkTooltipText(By by, String text) {
        try {
            textPresent(text);
        } catch (TimeoutException e) {
            hoverOverElement(findElement(By.id("searchSettings")));
            hoverOverElement(findElement(by));
            textPresent(text);
        }
    }

}
