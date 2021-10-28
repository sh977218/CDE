package gov.nih.nlm.board.cde;

import io.restassured.http.ContentType;
import io.restassured.http.Cookie;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

import static io.restassured.RestAssured.given;

public class PinReorderingTest extends BoardTest {

    @Test
    public void reorderPins() {
        mustBeLoggedInAs(classifyBoardUser_username,  password);
        goToBoard("Test Pinning Board");
        textPresent("Medication affecting cardiovascular function type exam day indicator", By.id("linkToElt_0"));
        reorderBySection("border-cdes","down",0);
        closeAlert();
        textPresent("Ethnicity USA maternal category", By.id("linkToElt_0"));
        reorderBySection("border-cdes","up",1);
        closeAlert();
        textPresent("Medication affecting cardiovascular function type exam day indicator", By.id("linkToElt_0"));
        driver.navigate().refresh();
        textPresent("Ethnic Group Category Text", By.id("linkToElt_2"));
        reorderBySection("border-cdes","top",2);
        closeAlert();
        textPresent("Ethnic Group Category Text", By.id("linkToElt_0"));
        reorderBySection("border-cdes","down",0);
        closeAlert();
        textPresent("Ethnic Group Category Text", By.id("linkToElt_1"));
        reorderBySection("border-cdes","down",1);
        closeAlert();
        textPresent("Ethnic Group Category Text", By.id("linkToElt_2"));
        textPresent("Medication affecting cardiovascular function type exam day indicator", By.id("linkToElt_0"));

        textPresent("Walking ability status", By.id("linkToElt_19"));
        reorderBySection("border-cdes","down",19);
        checkAlert("Saved");
        textPresent("Urinary tract surgical procedure indicator", By.id("linkToElt_19"));
        clickElement(By.cssSelector(".mat-paginator-navigation-next"));
        textPresent("Walking ability status", By.id("linkToElt_0"));
        reorderBySection("border-cdes","top",0);
        checkAlert("Saved");
        textPresent("Urinary tract surgical procedure indicator", By.id("linkToElt_0"));
        reorderBySection("border-cdes","up",0);
        checkAlert("Saved");
        textPresent("Brief Pain Inventory (BPI) - pain general activity interference scale", By.id("linkToElt_0"));

        clickElement(By.cssSelector(".mat-paginator-navigation-previous"));
        textPresent("Walking ability status", By.id("linkToElt_0"));
        textPresent("Urinary tract surgical procedure indicator", By.id("linkToElt_19"));
    }

}


