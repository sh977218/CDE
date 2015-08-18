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
        findElement(By.linkText("Permissible Values")).click();
        textPresent("Unknown");
        findElement(By.linkText("Concepts")).click();
        textPresent("Mutation Analysis");
        textPresent("C18302");
        findElement(By.linkText("History")).click();
        textPresent("This Data Element has no history");
        findElement(By.linkText("Classification")).click();
        WebElement csDl = findElement(By.id("repeatCs"));
        List<WebElement> csElements = csDl.findElements(By.cssSelector("#repeatCs ul li"));
        Assert.assertEquals(csElements.size(), 7);
        List<String> assertList = new ArrayList<>();
        assertList.add("GO Trial");
        assertList.add("GO New CDEs");
        assertList.add("C3D");
        assertList.add("caBIG");

        hangon(5);

        List<String> actualList = new ArrayList<>();
        for (WebElement csElt : csElements) {
            actualList.add(csElt.getText());
        }
        for (String a : assertList) {
            Assert.assertTrue(actualList.contains(a));
        }
        
        findElement(By.linkText("Identifiers")).click();
        textPresent("3157849");
        Assert.assertEquals("1", findElement(By.id("dd_version_nlm")).getText());

        findElement(By.linkText("General Details")).click();
        findElement(By.linkText("SDC View")).click();
        switchTab(1);
        textPresent("Genotype Directed Therapy Based on Mutation Testing?");
        textPresent("non-enumerated");
        switchTabAndClose(0);

    } 
    
    @Test
    public void vdInstruction() {
        setLowStatusesVisible();
        goToCdeByName("Participant Identifier Source");
        findElement(By.linkText("Permissible Values")).click();
        Assert.assertEquals("One of \"GUID\" or \"Source Registry Specific Identifier\"", findElement(By.id("dd_vd_def")).getText());
    }
    
    @Test
    public void searchBySteward() {
        goToCdeSearch();
        findElement(By.name("q")).sendKeys("steward:CIP");
        findElement(By.id("search.submit")).click();
        textPresent("1 results for");
        textPresent("Smoking Status");
    }
    
    
    @Test
    public void unitOfMeasure() {
        goToCdeByName("Laboratory Procedure Blood");
        textPresent("mg/dL");
    }

    
}