package gov.nih.nlm.form.test.search;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.testng.annotations.Test;

import java.util.List;

public class SwitchSearchTypeTest extends NlmCdeBaseTest {

    @Test
    public void formSwitchSearchType() {
        goToFormSearch();
        clickElement(By.id("search_by_classification_TEST"));
        clickElement(By.id("classif-NLM CDE Dev Team Test"));
        textNotPresent("NIH-Endorsed");
        textPresent("ACTIVE FORM FILTERS");
        searchActiveFilter("NLM CDE Dev Team Test");
        assertNoElt(By.xpath("//input[@type='checkbox'][../self::label[contains(., 'NIH-Endorsed')]]"));
        clickElement(By.xpath("//button[contains(@class, 'searchDropdown')][contains(., 'Form')]"));

        clickElement(By.xpath("//button[contains(., 'Search All CDEs')]"));
        textPresent("ACTIVE CDE FILTERS");
        searchActiveFilter("NLM CDE Dev Team Test");
        findElement(By.xpath("//input[@type='checkbox'][../self::label[contains(., 'NIH-Endorsed')]]"));
        clickElement(By.xpath("//button[contains(@class, 'searchDropdown')][contains(., 'All CDEs')]"));

        clickElement(By.xpath("//button[contains(., 'Search NIH-Endorsed CDEs')]"));
        textPresent("No results were found.");
        textPresent("ACTIVE CDE FILTERS");
        searchActiveFilter("NLM CDE Dev Team Test");
        findElement(By.xpath("//input[@type='checkbox'][../self::label[contains(., 'NIH-Endorsed')]]"));
        findElement(By.cssSelector("input" + cssInputCheckboxChecked));
        clickElement(By.xpath("//button[contains(@class, 'searchDropdown')][contains(., 'NIH-Endorsed CDEs')]"));

        clickElement(By.xpath("//button[contains(., 'Search Forms')]"));
        textPresent("ACTIVE FORM FILTERS");
        searchActiveFilter("NLM CDE Dev Team Test");
    }

    @Test
    public void cdeSwitchSearchType() {
        goToCdeSearch();
        clickElement(By.xpath("//*[@id='nihEndorsedHolder']//input"));
        clickElement(By.id("list_gridView"));
        findElements(By.xpath("//td[contains(@class,'nihEndorsed')]//img"));
        findElements(By.xpath("//td[contains(@class,'pin')]//mat-icon"));
    }

}
