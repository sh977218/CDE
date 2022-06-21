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
        pinToBoardFromViewPageWithoutModal(boardName);
        goToCdeByName(cdeName2);
        pinToBoardFromViewPageWithoutModal(boardName);

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

    @Test(dependsOnMethods = {"cdeMergeMineMine"})
    public void cantEditInCompare() {
        mustBeLoggedInAs(ctepEditor_username, password);
        String cdeName1 = "Person Birth Date";
        String cdeName2 = "Patient Ethnic Group Category";
        String boardName = "CantEditInCompare";
        createBoard(boardName, "Merge Test", "cde");

        goToCdeByName(cdeName1);
        pinToBoardFromViewPageWithModal(boardName);

        goToCdeByName(cdeName2);
        pinToBoardFromViewPageWithModal(boardName);

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
