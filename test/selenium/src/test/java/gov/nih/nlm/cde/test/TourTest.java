package gov.nih.nlm.cde.test;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class TourTest extends NlmCdeBaseTest {
    @Test
    public void deViewTour() {
        mustBeLoggedOut();
        goToCdeByName("Person Birth Date");
        findElement(By.linkText("Help")).click();
        findElement(By.linkText("Take a tour")).click();
        textPresent("an overview of the CDE attributes");
        getNext("to see what type of value are allowed");
        getNext("may have multiple names, often given");
        getNext("describe the way in which an organization may use a CDE");
        getNext("are sometimes described by one or more concepts");
        getNext("shows the status of the CDE");
        getNext("show attributes of the CDE that");
        getNext("may be identified multiple times across CDE users");
        getNext("If a the CDE is used in a Form, it will ");
        getNext("This section supports mapping of a CDE to external resources such as C-CDA document templates.");
        getNext("registered users are able to post");
        getNext("is used in a public board, the");
        getNext("If a file is attached to a CDE, it can");
        getNext("This section lists CDEs that are most similar");
        getNext("shows all prior states of the CDE");
        getNext("would like to propose a change to an existing CDE, he may create a fork");
        findElement(By.xpath("//button[@data-role='end']")).click();
    }

    private void getNext(String expectedText) {
        waitAndClick(By.xpath("//button[@data-role='next']"));
        textPresent(expectedText);
    }

    @Test
    public void listTour() {
        mustBeLoggedOut();
        goToCdeSearch();
        findElement(By.linkText("Help")).click();
        findElement(By.linkText("Take a tour")).click();
        textPresent("Welcome to the NIH");
        hangon(1);
        getNext("back to the CDE search page");
        getNext("take you to the Form search page");
        getNext("Boards allow registered users to group CDEs");
        getNext("The quick board is emptied when the");
        getNext("more documentation about this site or start this tour again");
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
        getNext("By default, CDEs in Recorded status");
        findElement(By.xpath("//button[@data-role='end']")).click();
    }


}
