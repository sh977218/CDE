package gov.nih.nlm.cde.test.boards;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class PublicBoardsTest extends BoardTest {

    @Test
    public void editBoard() {
        mustBeLoggedOut();
        clickElement(By.id("boardsLink"));
        findElement(By.name("search")).sendKeys("Depression");
        clickElement(By.id("search.submit"));
        textPresent("Schizophrenia");
        textPresent("Bipolar Disorder");
        textPresent("Geriatric Depression Scale (GDS) - empty life indicator");
        textPresent("Psychiatric history psychotic diagnosis type");
        textPresent("Hamilton Depression Rating Scale (HDRS) - suicide indicator");
    }
}
