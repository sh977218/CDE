package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.Test;

public class StewardOrgDetails extends NlmCdeBaseTest {

    @Test
    public void checkStewardOrgDetails() {
        goToCdeByName("MFLIE Hardship 24 Hour Nausea Personal Affect 7 Point Likert Scale");
        By by = By.linkText("caBIG");

        checkTooltipText(by, "Organization Details");
        checkTooltipText(by, "Cancer Biomedical Informatics Grid");
        checkTooltipText(by, "123 Somewhere On Earth, Abc, Def, 20001");
        checkTooltipText(by, "caBig@nih.gov");
        checkTooltipText(by, "111-222-3333");
        checkTooltipText(by, "https://cabig.nci.nih.gov/");

        // Changes Steward and save
        clickElement(By.id("dd_edit_steward"));
        new Select(findElement(By.id("elt.stewardOrg.name"))).selectByVisibleText("CTEP");
        hangon(.5);
        clickElement(By.id("elt.stewardOrg.name.ok"));
        textPresent("CTEP");
        newCdeVersion();

        goToCdeByName("MFLIE Hardship 24 Hour Nausea Personal Affect 7 Point Likert Scale");
        Assert.assertEquals("CTEP", findElement(By.id("dd_general_steward")).getText());
        hangon(1);

        by = By.linkText("CTEP");
        hoverOverElement(findElement(By.linkText("CTEP")));
        checkTooltipText(by, "Organization Details");
        checkTooltipText(by, "Cancer Therapy Evaluation Program");
        checkTooltipText(by, "75 Sunshine Street, Blah, Doh 12345");
        checkTooltipText(by, "https://cabig.nci.nih.gov/");
    }}
