package gov.nih.nlm.cde.test.search;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.util.ArrayList;
import java.util.List;

public class CdeSearchTest extends NlmCdeBaseTest {

    @Test
    public void cdeFullDetail() {
        goToCdeByName("Genotype Therapy Basis Mutation");
        textPresent("Genotype Therapy Basis Mutation Analysis Indicator");
        textPresent("Text descriptor to indicate whether "
                + "genotype directed therapy was based on mutation testing");
        textPresent("Qualified");
        clickElement(By.id("pvs_tab"));
        textPresent("Unknown");

        clickElement(By.id("concepts_tab"));
        textPresent("Mutation Analysis");
        textPresent("C18302");
        clickElement(By.id("history_tab"));
        textPresent("This Data Element has no history");
        clickElement(By.id("classification_tab"));
        WebElement csDl = findElement(By.id("repeatCs"));
        List<WebElement> csElements = csDl.findElements(By.cssSelector("#repeatCs ul li"));
        Assert.assertEquals(csElements.size(), 7);
        List<String> assertList = new ArrayList<String>();
        assertList.add("GO Trial");
        assertList.add("GO New CDEs");
        assertList.add("C3D");
        assertList.add("caBIG");

        hangon(5);

        List<String> actualList = new ArrayList<String>();
        for (WebElement csElt : csElements) {
            actualList.add(csElt.getText());
        }
        for (String a : assertList) {
            Assert.assertTrue(actualList.contains(a));
        }

        clickElement(By.linkText("Identifiers"));
        textPresent("3157849");
        Assert.assertEquals("1", findElement(By.id("dd_version_nlm")).getText());

        clickElement(By.id("general_tab"));
        clickElement(By.linkText("SDC View"));
        switchTab(1);
        textPresent("Genotype Directed Therapy Bas");
        textPresent("enumerated");
        switchTabAndClose(0);
    }

    @Test(priority = 5)
    public void vdInstruction() {
        setLowStatusesVisible();
        goToCdeByName("Participant Identifier Source");
        clickElement(By.id("pvs_tab"));
        Assert.assertEquals("One of \"GUID\" or \"Source Registry Specific Identifier\"", findElement(By.id("dd_vd_def")).getText());
    }

    @Test
    public void searchBySteward() {
        goToCdeSearch();
        findElement(By.name("q")).sendKeys("steward:CIP");
        clickElement(By.id("search.submit"));
        textPresent("1 results for");
        textPresent("Smoking Status");
    }

    @Test
    public void unitOfMeasure() {
        goToCdeByName("Laboratory Procedure Blood");
        textPresent("mg/dL");
    }


}