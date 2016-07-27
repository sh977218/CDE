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
        textPresent("Code Name 1", By.xpath("//*[@id='historyCompare_Concept_1']/div[contains(@class,'left')]//div[contains(@class,'name')]"));
        textPresent("Code ID 1", By.xpath("//*[@id='historyCompare_Concept_1']/div[contains(@class,'left')]//div[contains(@class,'originId')]"));
        textPresent("Alternative Name 1", By.xpath("//*[@id='historyCompare_Names_2']/div[contains(@class,'left')]//div[contains(@class,'designation')]"));
        textPresent("Alternative Definition 1", By.xpath("//*[@id='historyCompare_Names_2']/div[contains(@class,'left')]//div[contains(@class,'definition')]"));

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
        textPresent(newStatus, By.xpath("//*[@id='historyCompare_Status']//div[contains(@class,'left')]"));
        textPresent(oldStatus, By.xpath("//*[@id='historyCompare_Status']//div[contains(@class,'right')]"));

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
        selectHistoryAndCompare(1, 4);
        textPresent("Origin 1", By.xpath("//*[@id='historyCompare_IDs_1']/div[contains(@class,'left')]//div[contains(@class,'source')]"));
        textPresent("Identifier 1", By.xpath("//*[@id='historyCompare_IDs_1']/div[contains(@class,'left')]//div[contains(@class,'id')]"));
        textPresent("Version 1", By.xpath("//*[@id='historyCompare_IDs_1']/div[contains(@class,'left')]//div[contains(@class,'version')]"));
    }


}
