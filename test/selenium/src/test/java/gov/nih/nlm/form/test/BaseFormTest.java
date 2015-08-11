package gov.nih.nlm.form.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;

public class BaseFormTest extends NlmCdeBaseTest {

    protected void startAddingQuestions() {
        scrollToTop();
        try {
            textPresent("Show Question Search", By.id("startAddingQuestions"));
            findElement(By.id("startAddingQuestions")).click();
        } catch (Exception e) {
            // if button does not say show, then don't click it.
        }
    }

    public void stopAddingQuestions() {
        scrollToTop();
        textPresent("Hide Question Search", By.id("startAddingQuestions"));
        findElement(By.id("startAddingQuestions")).click();
    }

    protected void saveForm() {
        scrollToViewById("openSaveBottom");
        findElement(By.id("openSaveBottom")).click();
        findElement(By.name("version")).sendKeys("1");
        findElement(By.id("confirmNewVersion")).click();
        textPresent("Saved.");
        closeAlert();
        hangon(1);
        scrollToTop();
    }

    protected void searchForm(String query) {
        findElement(By.name("q")).sendKeys("\"" + query + "\"");
        hangon(1);
        findElement(By.id("search.submit")).click();
        showSearchFilters();
    }

    protected void gotoFormCreate() {
        findElement(By.linkText("Create")).click();
        findElement(By.linkText("Form")).click();
        textPresent("Create Form");
    }

    public void createForm(String name, String definition, String version, String org) {
        gotoFormCreate();
        findElement(By.id("formName")).sendKeys(name);
        findElement(By.id("formDefinition")).sendKeys(definition);
        if (version != null) {
            fillInput("Version", version);
        }
        new Select(findElement(By.id("newForm.stewardOrg.name"))).selectByVisibleText(org);
        findElement(By.id("createForm")).click();
        textPresent("Form created");
        closeAlert();
        hangon(1);
    }

    public void addSection(String title, String card) {
        int nbOfSections = driver.findElements(By.xpath("//div[starts-with(@id, 'section_view')]")).size();
        scrollToTop();
        findElement(By.linkText("Form Description")).click();

        findElement(By.id("addSection")).click();

        String section_title_path = "//div[@id='section_title_" + nbOfSections + "']";
        findElement(By.xpath(section_title_path + "//i")).click();
        findElement(By.xpath(section_title_path + "//input")).clear();
        findElement(By.xpath(section_title_path + "//input")).sendKeys(title);
        findElement(By.xpath(section_title_path + "//button[text()=' Confirm']")).click();

        if (card != null) {
            findElement(By.xpath("//i[@id='edit_section_card_" + nbOfSections + "']")).click();
            new Select(findElement(By.xpath("//select[@id='select_section_card_" + nbOfSections + "']"))).selectByVisibleText(card);
            findElement(By.xpath("//dd[@id='dd_card_" + nbOfSections + "']//button[@id='confirmCard']")).click();
        }
    }

}
