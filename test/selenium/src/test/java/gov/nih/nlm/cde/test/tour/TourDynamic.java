package gov.nih.nlm.cde.test.tour;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class TourDynamic extends TourBase {

    @Test
    public void takeDynamicTour() {
        goToCdeSearch();
        clickElement(By.id("homeLink"));
        checkTour();
    }

}
