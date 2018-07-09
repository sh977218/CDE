package gov.nih.nlm.system;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class WhatsNew extends NlmCdeBaseTest {

    @Test
    public void whatsNew() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        clickElement(By.id("username_link"));
        clickElement(By.linkText("Site Management"));
        clickElement(By.id("whatsNewTab"));
        clickElement(By.cssSelector(".fa-edit"));
        clickElement(By.xpath("//button[text() = 'Plain Text']"));

        findElement(By.cssSelector("textArea")).sendKeys("<h3>June 28, 2018</h3>\n" +
                "\n" +
                "<ul>\n" +
                "\t<li>Improvements to Smart on FHIR Apps.&nbsp;\n" +
                "\t<ul>\n" +
                "\t\t<li>When you create a Smart on FHIR App, you&nbsp;now have the option to map codes in the CDE Reposistory to other codes, such as local codes for examples.&nbsp;</li>\n" +
                "\t\t<li>We now support Compound Observations. For example, blood pressure.&nbsp;</li>\n" +
                "\t</ul>\n" +
                "\t</li>\n" +
                "</ul>\n" +
                "\n" +
                "<h3>June 11, 2018</h3>\n" +
                "\n" +
                "<ul>\n" +
                "\t<li>UI Improvements to form display profiles</li>\n" +
                "</ul>\n" +
                "\n" +
                "<h3>June 5, 2018</h3>\n" +
                "\n" +
                "<ul>\n" +
                "\t<li>Support for AccessGUIID UDI / DI as metadata on form collection.&nbsp;</li>\n" +
                "\t<li>Various improvements to accessibility</li>\n" +
                "\t<li>Modifying table preferences is now done directly in the search result tables.&nbsp;</li>\n" +
                "</ul>\n" +
                "\n" +
                "<h3>May 17, 2018</h3>\n" +
                "\n" +
                "<ul>\n" +
                "\t<li>Support for Permissible values in Smart on FHIR Apps.&nbsp;</li>\n" +
                "</ul>\n" +
                "\n" +
                "<h3>May 9, 2018</h3>\n" +
                "\n" +
                "<ul>\n" +
                "\t<li>Usability improvements in form editor. Drop areas highlight and skip logic autocomplete on names and codes.&nbsp;</li>\n" +
                "\t<li>Org Admins can now see all their drafts in one place.&nbsp;</li>\n" +
                "\t<li>Question answers can now be sorted.</li>\n" +
                "\t<li>Export Forms as FHIR Questionnaires.</li>\n" +
                "</ul>\n" +
                "\n" +
                "<h3>April 26, 2018</h3>\n" +
                "\n" +
                "<ul>\n" +
                "\t<li>You can now create Smart on FHIR Apps for your EHR. Contact the CDE team if you would like to&nbsp;get started.&nbsp;&nbsp;</li>\n" +
                "\t<li>See changes made in current draft. Deleting a draft prompts for confirmation.&nbsp;</li>\n" +
                "\t<li>Split Names and Definitions</li>\n" +
                "\t<li>When curating CDEs, you can now import all PVs from one CDE to another</li>\n" +
                "\t<li>UI Improvements to the history compare</li>\n" +
                "</ul>\n");

        clickElement(By.xpath("//button[text() = 'Rich Text']"));
        clickElement(By.cssSelector(".fa-check"));
        checkAlert("Saved");
        logout();
        clickElement(By.id("helpLink"));
        clickElement(By.id("whatsNewLink"));
        textPresent("June 28, 2018");
        textPresent("Usability improvements in form editor.");
    }

}
