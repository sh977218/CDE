package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.annotations.Test;

public class CdeMappingSpecificationTest extends NlmCdeBaseTest {


    @Test
    public void nonOwnerCantEdit() {
        String cdeName = "Tooth Sensitivity Mastication Second Oral Cavity Quadrant Assessment Scale";
        mustBeLoggedInAs(ninds_username, password);
        goToCdeByName(cdeName);
        clickElement(By.linkText("Mappings"));
        shortWait.until(ExpectedConditions.invisibilityOfElementLocated(By.id("addMappingSpecification")));
    }

    @Test
    public void addRemoveMappingSpecification() {
        mustBeLoggedInAs(ninds_username, password);
        String cdeName = "Alcohol Smoking and Substance Use Involvement Screening Test (ASSIST) - Hallucinogen problem frequency";

        //test add
        goToCdeByName(cdeName);
        showAllTabs();
        clickElement(By.id("mappingSpecifications_tab"));

        clickElement(By.id("addMappingSpecification"));

        findElement(By.id("newMappingSpecification.content")).sendKeys("MS Content 1");
        findElement(By.id("newMappingSpecification.type")).sendKeys("MS type 1");
        findElement(By.id("newMappingSpecification.script")).sendKeys("MS script 1");

        clickElement(By.id("createMappingSpecification"));
        textPresent("Mapping Specification Added");
        closeAlert();

        goToCdeByName(cdeName);
        showAllTabs();
        clickElement(By.id("mappingSpecifications_tab"));
        clickElement(By.id("addMappingSpecification"));
        findElement(By.id("newMappingSpecification.content")).sendKeys("Content");
        try {
            findElement(By.xpath("//li/a/strong[contains(text(), 'Content')]"));
        } catch (TimeoutException e) {
            goToCdeByName(cdeName);
            clickElement(By.linkText("Mappings"));
            clickElement(By.id("addMappingSpecification"));
            findElement(By.id("newMappingSpecification.content")).sendKeys("Content");
        }

        clickElement(By.id("cancelCreate"));
        modalGone();

        clickElement(By.id("removeMappingSpecification-0"));
        clickElement(By.id("confirmRemoveMappingSpecification-0"));

        textPresent("There are no mapping specifications");
        hangon(1);

    }


}
