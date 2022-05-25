package gov.nih.nlm.cde.test.merge;

import gov.nih.nlm.board.cde.BoardTest;
import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.annotations.Test;

public class CdeMergeMineMineTest extends BoardTest {
    @Test
    public void cdeMergeMineMine() {
        String cdeName1 = "Common Toxicity Criteria Adverse Event Colitis Grade";
        String cdeName2 = "Common Toxicity Criteria Adverse Event Hypophosphatemia Grade";
        mustBeLoggedInAs(ctepEditor_username, password);
        String boardName = "MergeMineMine";
        createBoard(boardName, "Merge Test", "cde");

        goToCdeByName(cdeName1);
        clickElement(By.id("addToBoard"));
        textPresent("Pinned to " + boardName);

        goToCdeByName(cdeName2);
        clickElement(By.id("addToBoard"));
        textPresent("Pinned to " + boardName);

        goToBoard(boardName);

        clickElement(By.id("elt_compare_0"));
        clickElement(By.id("elt_compare_1"));
        clickElement(By.id("qb_compare"));

        mergeCdeBySide("right");
        clickElement(By.id("selectAllMergeFieldsBtn"));
        clickElement(By.id("doMergeBtn"));
        textPresent("Retired", By.xpath("//*[@id='Status']//*[contains(@class,'noLeftPadding')]"));

        goToCdeByName(cdeName2);
        goToNaming();
        textPresent(cdeName1);
        textPresent("CTC Adverse Event Colitis Gra");
        textPresent("Colitis Grade");
        goToIdentifiers();
        textPresent("2005490");
        goToProperties();
        textPresent("MyKey2");
        goToReferenceDocuments();
        textPresent("Colitis ref doc");
        goToClassification();
        textPresent("TEST");
        textPresent("NLM CDE Dev Team Test");
        textPresent("All Candidates");
        textPresent("caBIG");
        sourcesPropertyValueContains("Name:", "caDSR");
        sourcesPropertyValueContains("Name:", "NCI");
    }

    @Test(dependsOnMethods={"cdeMergeMineMine"})
    public void cantEditInCompare() {
        mustBeLoggedInAs(ctepEditor_username, password);

        String boardName = "CantEditInCompare";
        createBoard(boardName, "Merge Test", "cde");

        goToCdeByName("Person Birth Date");
        clickElement(By.id("addToBoard"));
        clickBoardHeaderByName(boardName);
        checkAlert("Pinned to " + boardName);

        goToCdeByName("Patient Ethnic Group Category");
        clickElement(By.id("addToBoard"));
        clickBoardHeaderByName(boardName);
        checkAlert("Pinned to " + boardName);

        goToBoard(boardName);

        clickElement(By.id("elt_compare_0"));
        clickElement(By.id("elt_compare_1"));
        clickElement(By.id("qb_compare"));


        shortWait.until(ExpectedConditions.invisibilityOfElementLocated(By.xpath(xpathRegistrationStatusEditable())));
        shortWait.until(ExpectedConditions.invisibilityOfElementLocated(By.xpath("//button[contains(.,'Add Name')]")));
        shortWait.until(ExpectedConditions.invisibilityOfElementLocated(By.xpath("//mat-dialog-container//mat-icon[contains(., 'delete')]")));
        shortWait.until(ExpectedConditions.invisibilityOfElementLocated(By.xpath("//mat-dialog-container//mat-icon[. = 'edit']")));
    }

}
