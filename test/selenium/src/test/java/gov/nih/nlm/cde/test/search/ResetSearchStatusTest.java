package gov.nih.nlm.cde.test.search;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.util.List;
import java.util.ArrayList;

public class ResetSearchStatusTest extends NlmCdeBaseTest {
    @Test
    public void resetSearchStatus() {
        goToCdeSearch();
        driver.navigate().refresh();
        List<WebElement> classifications = driver.findElements(By.cssSelector("#classificationListHolder a"));
        int classifications_len = classifications.size();

        int classification_selected = (int) Math.random() * classifications_len;
        WebElement classification = classifications.get(classification_selected + 1);
        String classification_text = classification.getText();
        classification.click();
        findElement(By.id("resetSearch")).click();
        textPresent(classification_text);
    }
}
