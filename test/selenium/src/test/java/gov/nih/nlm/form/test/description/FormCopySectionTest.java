package gov.nih.nlm.form.test.description;

import gov.nih.nlm.form.test.BaseFormTest;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;
import org.testng.annotations.Test;

public class FormCopySectionTest extends BaseFormTest {
    @Test
    public void formCopySection() {
        String form1 = "Loinc Widget Test Form";
        String form2 = "Copy Section Form Test";
        mustBeLoggedInAs(nlm_username, nlm_username);
        goToFormByName(form1);
        goToFormDescription();
        clickElement(By.xpath("//*[@id='section_1']//mat-icon[normalize-space() = 'content_copy']"));
        newTab();
        switchTabAndClose(1);
        goToFormByName(form2);
        goToFormDescription();
        WebElement sourceElt = findElement(By.id("pasteSection"));
        WebElement targetElt = findElement(By.xpath("//tree-viewport/div/div/tree-node-drop-slot/*[@class='node-drop-slot']"));
        (new Actions(driver)).moveToElement(targetElt).perform();
        dragAndDrop(sourceElt, targetElt);
        newFormVersion();
        goToFormByName(form2);
        textPresent("Inside section form: PROMIS SF v1.0 - Phys. Function 10a");
    }
}
