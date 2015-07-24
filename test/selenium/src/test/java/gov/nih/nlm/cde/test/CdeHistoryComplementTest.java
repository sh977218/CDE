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
        goToCdeByName(cdeName);

        findElement(By.linkText("Naming")).click();
        findElement(By.id("addNamePair")).click();
        findElement(By.xpath("//label[text()=\"Name\"]/following-sibling::input")).sendKeys("Alternative Name 1");
        findElement(By.xpath("//label[text()=\"Definition\"]/following-sibling::textarea")).sendKeys("Alternative Definition 1");
        findElement(By.id("createNamePair")).click();
        modalGone();

        findElement(By.linkText("Concepts")).click();
        findElement(By.id("addConcept")).click();
        findElement(By.xpath("//label[text()=\"Code Name\"]/following-sibling::input")).sendKeys("Code Name 1");
        findElement(By.xpath("//label[text()=\"Code ID\"]/following-sibling::input")).sendKeys("Code ID 1");
        findElement(By.id("createConcept")).click();
        modalGone();

        newCdeVersion();


        checkInHistory("Concepts", "", "Code Name 1");
        checkInHistory("Concepts", "", "Code ID 1");
        checkInHistory("Naming", "", "Alternative Name 1");
        checkInHistory("Naming", "", "Alternative Definition 1");

        goToCdeByName(cdeName);
        findElement(By.xpath("//i[@id='editStatus']")).click();
        new Select(findElement(By.xpath("//label[text()=\"Registration Status\"]/following-sibling::select"))).selectByValue("Recorded");
        findElement(By.id("saveRegStatus")).click();
        modalGone();

        checkInHistory("Registration State", "Qualified", "Recorded");

        findElement(By.linkText("Identifiers")).click();
        closeAlert();
        findElement(By.id("addId")).click();
        findElement(By.xpath("//label[text()=\"Source\"]/following-sibling::input")).sendKeys("Origin 1");
        findElement(By.xpath("//label[text()=\"Identifier\"]/following-sibling::textarea")).sendKeys("Identifier 1");
        findElement(By.xpath("//label[text()=\"Version\"]/following-sibling::textarea")).sendKeys("Version 1");
        findElement(By.id("createId")).click();
        modalGone();
        goToCdeByName(cdeName, "Recorded");
        checkInHistory("Identifiers", "", "Origin 1");
        checkInHistory("Identifiers", "", "Identifier 1");
        checkInHistory("Identifiers", "", "Version 1");
    }


}
