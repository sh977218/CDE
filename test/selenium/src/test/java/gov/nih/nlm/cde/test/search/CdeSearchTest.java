package gov.nih.nlm.cde.test.search;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

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

        textPresent("GO Trial", By.xpath("//*[@id='GO Trial']"));
        textPresent("GO Trial", By.xpath("//*[@id='GO Trial,GO Trial']"));
        textPresent("GO New CDEs", By.xpath("//*[@id='GO Trial,GO New CDEs']"));
        textPresent("CCR Implementation", By.xpath("//*[@id='CCR Implementation']"));
        textPresent("caBIG", By.xpath("//*[@id='C3D Domain,caBIG']"));

        clickElement(By.id("ids_tab"));
        textPresent("3157849");
        Assert.assertEquals("1", findElement(By.id("dd_version_nlm")).getText());

        clickElement(By.id("general_tab"));
        clickElement(By.linkText("SDC View"));
        switchTab(1);
        textPresent("Genotype Directed Therapy Bas");
        textPresent("enumerated");
        switchTabAndClose(0);
    }

    @Test
    public void vdInstruction() {
        goToCdeByName("Participant Identifier Source");
        clickElement(By.id("pvs_tab"));
        textNotPresent("One of \"GUID\" or \"Source Registry Specific Identifier\"", By.id("instructions"));
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