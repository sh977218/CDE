package gov.nih.nlm.cde.test.tour;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class TourStatic extends TourBase {

    @Test
    public void takeStaticTour() {
        goHomeStatic();
        clickElement(By.id("takeATourBtn"));
        textPresent("This tour will guide you through");
    }

}
