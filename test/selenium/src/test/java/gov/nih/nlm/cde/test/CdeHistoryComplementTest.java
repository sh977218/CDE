package gov.nih.nlm.cde.test;


import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.annotations.Test;

public class CdeHistoryComplementTest extends NlmCdeBaseTest {

    @Test
    public void cdeHistoryComplement() {
        mustBeLoggedInAs(ctepCurator_username, password);
        String cdeName = "Metastatic Disease or Disorder Magnetic Resonance Imaging Cerebrospinal Fluid Diagnosis Ind-2";
        String newStatus = "Recorded";
        String oldStatus = "Qualified";
        goToCdeByName(cdeName);

        showAllTabs();
        clickElement(By.id("naming_tab"));
        clickElement(By.id("addNamePair"));
        findElement(By.xpath("//label[text()='Name']/following-sibling::input")).sendKeys("Alternative Name 1");
        findElement(By.xpath("//label[text()='Definition']/following-sibling::textarea")).sendKeys("Alternative Definition 1");
        clickElement(By.id("createNamePair"));
        modalGone();

        clickElement(By.id("concepts_tab"));
        clickElement(By.id("addConcept"));
        findElement(By.xpath("//label[text()='Code Name']/following-sibling::input")).sendKeys("Code Name 1");
        findElement(By.xpath("//label[text()='Code ID']/following-sibling::input")).sendKeys("Code ID 1");
        clickElement(By.id("createConcept"));
        modalGone();

        newCdeVersion();

        clickElement(By.id("history_tab"));
        selectHistoryAndCompare(1, 2);
        textPresent("Alternative Name 1", By.xpath("//*[@id='historyCompareLeft_Naming_0_0']//div[@data-title='designation']"));
        textPresent("Alternative Definition 1", By.xpath("//*[@id='historyCompareLeft_Naming_0_0']//div[@data-title='definition']"));
        textPresent("Code Name 1", By.xpath("//*[@id='historyCompareLeft_Data Element Concepts_0_0']//div[@data-title='name']"));
        textPresent("Code ID 1", By.xpath("//*[@id='historyCompareLeft_Data Element Concepts_0_0']//div[@data-title='originId']"));

        goToCdeByName(cdeName);
        showAllTabs();
        clickElement(By.id("status_tab"));
        textPresent("Unresolved Issue");
        clickElement(By.xpath("//*[@id='editStatus']"));
        new Select(findElement(By.xpath("//label[text()='Registration Status']/following-sibling::select"))).selectByValue(newStatus);
        clickElement(By.id("saveRegStatus"));
        modalGone();

        clickElement(By.id("history_tab"));
        selectHistoryAndCompare(1, 2);
        textPresent(newStatus, By.xpath("//*[@id='historyCompareLeft_Status']"));
        textPresent(oldStatus, By.xpath("//*[@id='historyCompareRight_Status']"));

        clickElement(By.id("ids_tab"));
        closeAlert();
        clickElement(By.id("addId"));
        findElement(By.xpath("//label[text()='Source']/following-sibling::input")).sendKeys("Origin 1");
        findElement(By.xpath("//label[text()='Identifier']/following-sibling::textarea")).sendKeys("Identifier 1");
        findElement(By.xpath("//label[text()='Version']/following-sibling::textarea")).sendKeys("Version 1");
        clickElement(By.id("createId"));
        modalGone();
        goToCdeByName(cdeName);
        showAllTabs();
        clickElement(By.id("history_tab"));
        selectHistoryAndCompare(1, 2);
        textPresent("Origin 1", By.xpath("//*//*[@id='historyCompareLeft_Identifiers_0_1']//*[@data-title='source']"));
        textPresent("Identifier 1", By.xpath("//*[@id='historyCompareLeft_Identifiers_0_1']//*[@data-title='id']"));
        textPresent("Version 1", By.xpath("//*[@id='historyCompareLeft_Identifiers_0_1']//*[@data-title='version']"));
    }


}
