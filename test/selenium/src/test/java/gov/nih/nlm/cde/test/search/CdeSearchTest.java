package gov.nih.nlm.cde.test.search;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class CdeSearchTest extends NlmCdeBaseTest {

    public void fullDetail() {
        goToCdeByName("Genotype Therapy Basis Mutation");
        textPresent("Genotype Therapy Basis Mutation Analysis Indicator");
        textPresent("Text descriptor to indicate whether genotype directed therapy was based on mutation testing");
        textPresent("Qualified");
        goToPermissibleValues();
        textPresent("Unknown");

        goToConcepts();
        textPresent("Mutation Analysis");
        textPresent("C18302");
        goToHistory();
        textPresent("Viewing");
        goToClassification();

        textPresent("GO Trial", By.xpath("//*[@id='GO Trial']"));
        textPresent("GO Trial", By.xpath("//*[@id='GO Trial,GO Trial']"));
        textPresent("GO New CDEs", By.xpath("//*[@id='GO Trial,GO New CDEs']"));
        textPresent("CCR Implementation", By.xpath("//*[@id='CCR Implementation']"));
        textPresent("caBIG", By.xpath("//*[@id='C3D Domain,caBIG']"));

        goToIdentifiers();
        textPresent("3157849");
        Assert.assertEquals("1", findElement(By.cssSelector("[itemprop='version']")).getText());
    }

    @Test
    public void cdeFullDetail() {
        fullDetail();
    }


    @Test
    public void vdInstruction() {
        goToCdeByName("Participant Identifier Source");
        goToPermissibleValues();
        textPresent("One of \"GUID\" or \"Source Registry Specific Identifier\"", By.cssSelector("[itemprop='instructions']"));
    }

    @Test
    public void searchBySteward() {
        goToCdeSearch();
        findElement(By.name("q")).sendKeys("steward:CIP");
        clickElement(By.id("search.submit"));
        textPresent("1 data element results for");
        textPresent("Smoking Status");
    }

    @Test
    public void unitOfMeasure() {
        goToCdeByName("Laboratory Procedure Blood");
        textPresent("mg/dL");
    }


}