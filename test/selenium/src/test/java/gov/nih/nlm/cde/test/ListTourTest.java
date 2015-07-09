package gov.nih.nlm.cde.test;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class ListTourTest extends TourTest {

    @Test
    public void listTour() {
        mustBeLoggedOut();
        goToCdeSearch();
        findElement(By.id("browseOrg-NINDS")).click();
        hangon(0.5);
        findElement(By.linkText("Help")).click();
        findElement(By.linkText("Take a tour")).click();
        textPresent("Welcome to the NIH");
        hangon(1);
        getNext("back to the CDE search page");
        getNext("take you to the Form search page");
        getNext("Boards allow registered users to group CDEs");
        getNext("The quick board is emptied when the");
        getNext("more documentation about this site or start this tour again");
        getNext("Personalize your search results.");
        getNext("For example, search for");
        getNext("a combination of most relevant and higher status CDEs first");
        getNext(" to view the CDE summary");
        getNext("Click the eye to see the full detail");
        getNext("The plus sign will add a CDE");
        getNext("view shows all search results (max 1000)");
        getNext("If your screen is small and the");
        getNext("tree to filter results by context, domain,");
        getNext("You can add a second classification ");
        getNext("See which filter are applied");
        getNext("Restrict search to one or more ");
        findElement(By.xpath("//button[@data-role='end']")).click();
    }

}
