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
        List<WebElement> classfications = driver.findElements(By.cssSelector("#classificationListHolder a"));
        int c_en = classfications.size();
        System.out.println("c_en:" + c_en);
        int c_selected = randomPick(c_en);
        System.out.println("c_selected:" + c_selected);
        WebElement c = classfications.get(c_selected + 1);
        String c_str = c.getText();
        c.click();
        findElement(By.id("resetSearch")).click();
        textPresent(c_str);
    }

    private int randomPick(int i) {
        return (int) Math.random() * i;
    }
}
