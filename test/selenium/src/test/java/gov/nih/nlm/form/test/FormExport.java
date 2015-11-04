package gov.nih.nlm.form.test;

import static com.jayway.restassured.RestAssured.get;
import org.testng.Assert;
import org.testng.annotations.Test;
import org.openqa.selenium.By;

public class FormExport extends BaseFormTest {
    @Test
    public void odmExport() {
        String response = get(baseUrl + "/form/7JrNn_FIx?type=xml&subtype=odm").asString();
        String expectedResult =
                "<Study OID=\"7JrNn_FIx\">\n" +
                "<GlobalVariables>\n" +
                "<StudyName>PROMIS SF v2.0 - Instrumental Support 8a</StudyName>\n" +
                "<StudyDescription>N/A</StudyDescription>\n" +
                "<ProtocolName>PROMIS SF v2.0 - Instrumental Support 8a</ProtocolName>\n" +
                "</GlobalVariables>\n" +
                "<BasicDefinitions/>\n" +
                "<MetaDataVersion Name=\"PROMIS SF v2.0 - Instrumental Support 8a\" OID=\"MDV_7JrNn_FIx\">\n" +
                "<Protocol>\n" +
                "<StudyEventRef Mandatory=\"Yes\" OrderNumber=\"1\" StudyEventOID=\"SE_7JrNn_FIx\"/>\n" +
                "</Protocol>\n" +
                "<StudyEventDef Name=\"SE\" OID=\"SE_7JrNn_FIx\" Repeating=\"No\" Type=\"Unscheduled\">\n" +
                "<FormRef FormOID=\"7JrNn_FIx\" Mandatory=\"Yes\" OrderNumber=\"1\"/>\n" +
                "</StudyEventDef>\n" +
                "<FormDef Name=\"PROMIS SF v2.0 - Instrumental Support 8a\" OID=\"7JrNn_FIx\" Repeating=\"No\">\n" +
                "<ItemGroupRef ItemGroupOID=\"d2c24d59e0baff4d0155fbdf62590867\" Mandatory=\"Yes\" OrderNumber=\"1\"/>\n" +
                "</FormDef>\n" +
                "<ItemGroupDef Name=\"Section\" OID=\"d2c24d59e0baff4d0155fbdf62590867\" Repeating=\"No\">\n" +
                "<Description>\n" +
                "<TranslatedText xml:lang=\"en\">Section</TranslatedText>\n" +
                "</Description>\n" +
                "<ItemRef ItemOID=\"QJvJOh1Ql_s0_q0\" Mandatory=\"Yes\" OrderNumber=\"0\"/>\n" +
                "<ItemRef ItemOID=\"myePJdnkml_s0_q1\" Mandatory=\"Yes\" OrderNumber=\"1\"/>\n" +
                "<ItemRef ItemOID=\"Qy_vkdnJmx_s0_q2\" Mandatory=\"Yes\" OrderNumber=\"2\"/>\n" +
                "<ItemRef ItemOID=\"7yMvJ_3Jme_s0_q3\" Mandatory=\"Yes\" OrderNumber=\"3\"/>\n" +
                "<ItemRef ItemOID=\"QJmDkOhyme_s0_q4\" Mandatory=\"Yes\" OrderNumber=\"4\"/>\n" +
                "<ItemRef ItemOID=\"m14P1d21Xl_s0_q5\" Mandatory=\"Yes\" OrderNumber=\"5\"/>\n" +
                "<ItemRef ItemOID=\"mkHv1dhy7x_s0_q6\" Mandatory=\"Yes\" OrderNumber=\"6\"/>\n" +
                "<ItemRef ItemOID=\"mkUwk_hymg_s0_q7\" Mandatory=\"Yes\" OrderNumber=\"7\"/>\n" +
                "</ItemGroupDef>\n" +
                "<ItemDef DataType=\"text\" Name=\"Do you have someone to help you if you are confined to bed?\" OID=\"QJvJOh1Ql_s0_q0\">\n" +
                "<Question>\n" +
                "<TranslatedText xml:lang=\"en\">\n" +
                "Do you have someone to help you if you are confined to bed?\n" +
                "</TranslatedText>\n" +
                "</Question>\n" +
                "<CodeListRef CodeListOID=\"CL_QJvJOh1Ql_s0_q0\"/>\n" +
                "</ItemDef>\n" +
                "<ItemDef DataType=\"text\" Name=\"Do you have someone to take you to the doctor if you need it?\" OID=\"myePJdnkml_s0_q1\">\n" +
                "<Question>\n" +
                "<TranslatedText xml:lang=\"en\">\n" +
                "Do you have someone to take you to the doctor if you need it?\n" +
                "</TranslatedText>\n" +
                "</Question>\n" +
                "<CodeListRef CodeListOID=\"CL_QJvJOh1Ql_s0_q0\"/>\n" +
                "</ItemDef>\n" +
                "<ItemDef DataType=\"text\" Name=\"Do you have someone to help with your daily chores if you are sick?\" OID=\"Qy_vkdnJmx_s0_q2\">\n" +
                "<Question>\n" +
                "<TranslatedText xml:lang=\"en\">\n" +
                "Do you have someone to help with your daily chores if you are sick?\n" +
                "</TranslatedText>\n" +
                "</Question>\n" +
                "<CodeListRef CodeListOID=\"CL_QJvJOh1Ql_s0_q0\"/>\n" +
                "</ItemDef>\n" +
                "<ItemDef DataType=\"text\" Name=\"Do you have someone to run errands if you need it?\" OID=\"7yMvJ_3Jme_s0_q3\">\n" +
                "<Question>\n" +
                "<TranslatedText xml:lang=\"en\">Do you have someone to run errands if you need it?</TranslatedText>\n" +
                "</Question>\n" +
                "<CodeListRef CodeListOID=\"CL_QJvJOh1Ql_s0_q0\"/>\n" +
                "</ItemDef>\n" +
                "<ItemDef DataType=\"text\" Name=\"Do you have someone to prepare your meals if you are unable to do it yourself?\" OID=\"QJmDkOhyme_s0_q4\">\n" +
                "<Question>\n" +
                "<TranslatedText xml:lang=\"en\">\n" +
                "Do you have someone to prepare your meals if you are unable to do it yourself?\n" +
                "</TranslatedText>\n" +
                "</Question>\n" +
                "<CodeListRef CodeListOID=\"CL_QJvJOh1Ql_s0_q0\"/>\n" +
                "</ItemDef>\n" +
                "<ItemDef DataType=\"text\" Name=\"Do you have someone to take over all of your responsibilities at home if you need it?\" OID=\"m14P1d21Xl_s0_q5\">\n" +
                "<Question>\n" +
                "<TranslatedText xml:lang=\"en\">\n" +
                "Do you have someone to take over all of your responsibilities at home if you need it?\n" +
                "</TranslatedText>\n" +
                "</Question>\n" +
                "<CodeListRef CodeListOID=\"CL_QJvJOh1Ql_s0_q0\"/>\n" +
                "</ItemDef>\n" +
                "<ItemDef DataType=\"text\" Name=\"Is someone available to help you if you need it?\" OID=\"mkHv1dhy7x_s0_q6\">\n" +
                "<Question>\n" +
                "<TranslatedText xml:lang=\"en\">Is someone available to help you if you need it?</TranslatedText>\n" +
                "</Question>\n" +
                "<CodeListRef CodeListOID=\"CL_QJvJOh1Ql_s0_q0\"/>\n" +
                "</ItemDef>\n" +
                "<ItemDef DataType=\"text\" Name=\"Do you have someone to help you clean up around the home if you need it?\" OID=\"mkUwk_hymg_s0_q7\">\n" +
                "<Question>\n" +
                "<TranslatedText xml:lang=\"en\">\n" +
                "Do you have someone to help you clean up around the home if you need it?\n" +
                "</TranslatedText>\n" +
                "</Question>\n" +
                "<CodeListRef CodeListOID=\"CL_QJvJOh1Ql_s0_q0\"/>\n" +
                "</ItemDef>\n" +
                "<CodeList DataType=\"text\" OID=\"CL_QJvJOh1Ql_s0_q0\" Name=\"Do you have someone to help you if you are confined to bed?\">\n" +
                "<CodeListItem CodedValue=\"1\">\n" +
                "<Decode>\n" +
                "<TranslatedText xml:lang=\"en\">Never</TranslatedText>\n" +
                "</Decode>\n" +
                "<Alias Context=\"LOINC\" Name=\"LA6270-8\"/>\n" +
                "</CodeListItem>\n" +
                "<CodeListItem CodedValue=\"2\">\n" +
                "<Decode>\n" +
                "<TranslatedText xml:lang=\"en\">Rarely</TranslatedText>\n" +
                "</Decode>\n" +
                "<Alias Context=\"LOINC\" Name=\"LA10066-1\"/>\n" +
                "</CodeListItem>\n" +
                "<CodeListItem CodedValue=\"3\">\n" +
                "<Decode>\n" +
                "<TranslatedText xml:lang=\"en\">Sometimes</TranslatedText>\n" +
                "</Decode>\n" +
                "<Alias Context=\"LOINC\" Name=\"LA10082-8\"/>\n" +
                "</CodeListItem>\n" +
                "<CodeListItem CodedValue=\"4\">\n" +
                "<Decode>\n" +
                "<TranslatedText xml:lang=\"en\">Usually</TranslatedText>\n" +
                "</Decode>\n" +
                "<Alias Context=\"LOINC\" Name=\"LA14747-2\"/>\n" +
                "</CodeListItem>\n" +
                "<CodeListItem CodedValue=\"5\">\n" +
                "<Decode>\n" +
                "<TranslatedText xml:lang=\"en\">Always</TranslatedText>\n" +
                "</Decode>\n" +
                "<Alias Context=\"LOINC\" Name=\"LA9933-8\"/>\n" +
                "</CodeListItem>\n" +
                "</CodeList>\n" +
                "</MetaDataVersion>\n" +
                "</Study>\n" +
                "</ODM>";

        Assert.assertTrue(response.replaceAll("\\s+","").contains(expectedResult.replaceAll("\\s+","")));

    }

    @Test
    public void jsonExport() {
        String form = "Parenchymal Imaging";
        goToFormByName(form);

        findElement(By.id("export")).click();
        findElement(By.id("nihJson")).click();

        switchTab(1);
        String response = findElement(By.cssSelector("HTML")).getAttribute("innerHTML");
        Assert.assertTrue(response.contains("\"naming\":[{\"designation\":\"Parenchymal Imaging\",\"definition\":\"Contains data elements collected when an imaging study is performed to measure parenchyma; data recorded attempt to divide the strokes into ischemic or hemorrhagic subtypes, as distinction of hemorrhage versus infarction is the initial critical branch point in acute stroke triage.  (Examples of CDEs included: Acute infarcts present; Planimetic acute ischemic lesion volume; and Acute hematoma present)\"}]}"));
        switchTabAndClose(0);
    }


    @Test
    public void xmlExport() {
        String form = "Parenchymal Imaging";
        goToFormByName(form);

        findElement(By.id("export")).click();
        String url = findElement(By.id("nihXml")).getAttribute("href");
        String response = get(url).asString();
        Assert.assertTrue(response.replaceAll("\\s+","").contains(("<naming>\n" +
                "<designation>Parenchymal Imaging</designation>\n" +
                "<definition>\n" +
                "Contains data elements collected when an imaging study is performed to measure parenchyma; data recorded attempt to divide the strokes into ischemic or hemorrhagic subtypes, as distinction of hemorrhage versus infarction is the initial critical branch point in acute stroke triage. (Examples of CDEs included: Acute infarcts present; Planimetic acute ischemic lesion volume; and Acute hematoma present)\n" +
                "</definition>\n" +
                "</naming>").replaceAll("\\s+", "")));
    }

}
