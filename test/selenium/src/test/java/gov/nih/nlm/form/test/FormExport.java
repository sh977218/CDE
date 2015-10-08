package gov.nih.nlm.form.test;

import static com.jayway.restassured.RestAssured.given;

public class FormExport extends BaseFormTest {
    @Test
    public void odmExport() {
        String response = given().contentType("application/json; charset=UTF-16").when().get(baseUrl + "/7JrNn_FIx?type=xml&subtype=odm").asString();

        Assert.assertTrue(response.replaceAll("\\s+","").contains("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
                "<ODM CreationDateTime=\"2015-10-08T19:48:31.811Z\" FileOID=\"7JrNn_FIx\" FileType=\"Snapshot\" xmlns=\"http://www.cdisc.org/ns/odm/v1.3\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xsi:noNamespaceSchemaLocation=\"ODM1-3-2.xsd\" Granularity=\"Metadata\" ODMVersion=\"1.3\">\n" +
                "\t<Study OID=\"7JrNn_FIx\">\n" +
                "\t\t<GlobalVariables>\n" +
                "\t\t\t<StudyName>PROMIS SF v2.0 - Instrumental Support 8a</StudyName>\n" +
                "\t\t\t<StudyDescription>N/A</StudyDescription>\n" +
                "\t\t\t<ProtocolName>PROMIS SF v2.0 - Instrumental Support 8a</ProtocolName>\n" +
                "\t\t</GlobalVariables>\n" +
                "\t\t<BasicDefinitions/>\n" +
                "\t\t<MetaDataVersion Name=\"PROMIS SF v2.0 - Instrumental Support 8a\" OID=\"MDV_7JrNn_FIx\">\n" +
                "\t\t\t<Protocol>\n" +
                "\t\t\t\t<StudyEventRef Mandatory=\"Yes\" OrderNumber=\"1\" StudyEventOID=\"SE_7JrNn_FIx\"/>\n" +
                "\t\t\t</Protocol>\n" +
                "\t\t\t<StudyEventDef Name=\"SE\" OID=\"SE_7JrNn_FIx\" Repeating=\"No\" Type=\"Unscheduled\">\n" +
                "\t\t\t\t<FormRef FormOID=\"7JrNn_FIx\" Mandatory=\"Yes\" OrderNumber=\"1\"/>\n" +
                "\t\t\t</StudyEventDef>\n" +
                "\t\t\t<FormDef Name=\"PROMIS SF v2.0 - Instrumental Support 8a\" OID=\"7JrNn_FIx\" Repeating=\"No\">\n" +
                "\t\t\t\t<ItemGroupRef ItemGroupOID=\"118\" Mandatory=\"Yes\" OrderNumber=\"1\"/>\n" +
                "\t\t\t</FormDef>\n" +
                "\t\t\t<ItemGroupDef Name=\"Section\" OID=\"118\" Repeating=\"No\">\n" +
                "\t\t\t\t<Description>\n" +
                "\t\t\t\t\t<TranslatedText xml:lang=\"en\">Section</TranslatedText>\n" +
                "\t\t\t\t</Description>\n" +
                "\t\t\t\t<ItemRef ItemOID=\"QJvJOh1Ql_s0_q0\" Mandatory=\"Yes\" OrderNumber=\"0\"/>\n" +
                "\t\t\t\t<ItemRef ItemOID=\"myePJdnkml_s0_q1\" Mandatory=\"Yes\" OrderNumber=\"1\"/>\n" +
                "\t\t\t\t<ItemRef ItemOID=\"Qy_vkdnJmx_s0_q2\" Mandatory=\"Yes\" OrderNumber=\"2\"/>\n" +
                "\t\t\t\t<ItemRef ItemOID=\"7yMvJ_3Jme_s0_q3\" Mandatory=\"Yes\" OrderNumber=\"3\"/>\n" +
                "\t\t\t\t<ItemRef ItemOID=\"QJmDkOhyme_s0_q4\" Mandatory=\"Yes\" OrderNumber=\"4\"/>\n" +
                "\t\t\t\t<ItemRef ItemOID=\"m14P1d21Xl_s0_q5\" Mandatory=\"Yes\" OrderNumber=\"5\"/>\n" +
                "\t\t\t\t<ItemRef ItemOID=\"mkHv1dhy7x_s0_q6\" Mandatory=\"Yes\" OrderNumber=\"6\"/>\n" +
                "\t\t\t\t<ItemRef ItemOID=\"mkUwk_hymg_s0_q7\" Mandatory=\"Yes\" OrderNumber=\"7\"/>\n" +
                "\t\t\t</ItemGroupDef>\n" +
                "\t\t\t<ItemDef DataType=\"text\" Name=\"Do you have someone to help you if you are confined to bed?\" OID=\"QJvJOh1Ql_s0_q0\">\n" +
                "\t\t\t\t<Question>\n" +
                "\t\t\t\t\t<TranslatedText xml:lang=\"en\">Do you have someone to help you if you are confined to bed?</TranslatedText>\n" +
                "\t\t\t\t</Question>\n" +
                "\t\t\t\t<CodeListRef CodeListOID=\"CL_QJvJOh1Ql_s0_q0\"/>\n" +
                "\t\t\t</ItemDef>\n" +
                "\t\t\t<ItemDef DataType=\"text\" Name=\"Do you have someone to take you to the doctor if you need it?\" OID=\"myePJdnkml_s0_q1\">\n" +
                "\t\t\t\t<Question>\n" +
                "\t\t\t\t\t<TranslatedText xml:lang=\"en\">Do you have someone to take you to the doctor if you need it?</TranslatedText>\n" +
                "\t\t\t\t</Question>\n" +
                "\t\t\t\t<CodeListRef CodeListOID=\"CL_QJvJOh1Ql_s0_q0\"/>\n" +
                "\t\t\t</ItemDef>\n" +
                "\t\t\t<ItemDef DataType=\"text\" Name=\"Do you have someone to help with your daily chores if you are sick?\" OID=\"Qy_vkdnJmx_s0_q2\">\n" +
                "\t\t\t\t<Question>\n" +
                "\t\t\t\t\t<TranslatedText xml:lang=\"en\">Do you have someone to help with your daily chores if you are sick?</TranslatedText>\n" +
                "\t\t\t\t</Question>\n" +
                "\t\t\t\t<CodeListRef CodeListOID=\"CL_QJvJOh1Ql_s0_q0\"/>\n" +
                "\t\t\t</ItemDef>\n" +
                "\t\t\t<ItemDef DataType=\"text\" Name=\"Do you have someone to run errands if you need it?\" OID=\"7yMvJ_3Jme_s0_q3\">\n" +
                "\t\t\t\t<Question>\n" +
                "\t\t\t\t\t<TranslatedText xml:lang=\"en\">Do you have someone to run errands if you need it?</TranslatedText>\n" +
                "\t\t\t\t</Question>\n" +
                "\t\t\t\t<CodeListRef CodeListOID=\"CL_QJvJOh1Ql_s0_q0\"/>\n" +
                "\t\t\t</ItemDef>\n" +
                "\t\t\t<ItemDef DataType=\"text\" Name=\"Do you have someone to prepare your meals if you are unable to do it yourself?\" OID=\"QJmDkOhyme_s0_q4\">\n" +
                "\t\t\t\t<Question>\n" +
                "\t\t\t\t\t<TranslatedText xml:lang=\"en\">Do you have someone to prepare your meals if you are unable to do it yourself?</TranslatedText>\n" +
                "\t\t\t\t</Question>\n" +
                "\t\t\t\t<CodeListRef CodeListOID=\"CL_QJvJOh1Ql_s0_q0\"/>\n" +
                "\t\t\t</ItemDef>\n" +
                "\t\t\t<ItemDef DataType=\"text\" Name=\"Do you have someone to take over all of your responsibilities at home if you need it?\" OID=\"m14P1d21Xl_s0_q5\">\n" +
                "\t\t\t\t<Question>\n" +
                "\t\t\t\t\t<TranslatedText xml:lang=\"en\">Do you have someone to take over all of your responsibilities at home if you need it?</TranslatedText>\n" +
                "\t\t\t\t</Question>\n" +
                "\t\t\t\t<CodeListRef CodeListOID=\"CL_QJvJOh1Ql_s0_q0\"/>\n" +
                "\t\t\t</ItemDef>\n" +
                "\t\t\t<ItemDef DataType=\"text\" Name=\"Is someone available to help you if you need it?\" OID=\"mkHv1dhy7x_s0_q6\">\n" +
                "\t\t\t\t<Question>\n" +
                "\t\t\t\t\t<TranslatedText xml:lang=\"en\">Is someone available to help you if you need it?</TranslatedText>\n" +
                "\t\t\t\t</Question>\n" +
                "\t\t\t\t<CodeListRef CodeListOID=\"CL_QJvJOh1Ql_s0_q0\"/>\n" +
                "\t\t\t</ItemDef>\n" +
                "\t\t\t<ItemDef DataType=\"text\" Name=\"Do you have someone to help you clean up around the home if you need it?\" OID=\"mkUwk_hymg_s0_q7\">\n" +
                "\t\t\t\t<Question>\n" +
                "\t\t\t\t\t<TranslatedText xml:lang=\"en\">Do you have someone to help you clean up around the home if you need it?</TranslatedText>\n" +
                "\t\t\t\t</Question>\n" +
                "\t\t\t\t<CodeListRef CodeListOID=\"CL_QJvJOh1Ql_s0_q0\"/>\n" +
                "\t\t\t</ItemDef>\n" +
                "\t\t\t<CodeList DataType=\"text\" OID=\"CL_QJvJOh1Ql_s0_q0\" Name=\"Do you have someone to help you if you are confined to bed?\">\n" +
                "\t\t\t\t<CodeListItem CodedValue=\"1\">\n" +
                "\t\t\t\t\t<Decode>\n" +
                "\t\t\t\t\t\t<TranslatedText xml:lang=\"en\">Never</TranslatedText>\n" +
                "\t\t\t\t\t</Decode>\n" +
                "\t\t\t\t\t<Alias Context=\"LOINC\" Name=\"LA6270-8\"/>\n" +
                "\t\t\t\t</CodeListItem>\n" +
                "\t\t\t\t<CodeListItem CodedValue=\"2\">\n" +
                "\t\t\t\t\t<Decode>\n" +
                "\t\t\t\t\t\t<TranslatedText xml:lang=\"en\">Rarely</TranslatedText>\n" +
                "\t\t\t\t\t</Decode>\n" +
                "\t\t\t\t\t<Alias Context=\"LOINC\" Name=\"LA10066-1\"/>\n" +
                "\t\t\t\t</CodeListItem>\n" +
                "\t\t\t\t<CodeListItem CodedValue=\"3\">\n" +
                "\t\t\t\t\t<Decode>\n" +
                "\t\t\t\t\t\t<TranslatedText xml:lang=\"en\">Sometimes</TranslatedText>\n" +
                "\t\t\t\t\t</Decode>\n" +
                "\t\t\t\t\t<Alias Context=\"LOINC\" Name=\"LA10082-8\"/>\n" +
                "\t\t\t\t</CodeListItem>\n" +
                "\t\t\t\t<CodeListItem CodedValue=\"4\">\n" +
                "\t\t\t\t\t<Decode>\n" +
                "\t\t\t\t\t\t<TranslatedText xml:lang=\"en\">Usually</TranslatedText>\n" +
                "\t\t\t\t\t</Decode>\n" +
                "\t\t\t\t\t<Alias Context=\"LOINC\" Name=\"LA14747-2\"/>\n" +
                "\t\t\t\t</CodeListItem>\n" +
                "\t\t\t\t<CodeListItem CodedValue=\"5\">\n" +
                "\t\t\t\t\t<Decode>\n" +
                "\t\t\t\t\t\t<TranslatedText xml:lang=\"en\">Always</TranslatedText>\n" +
                "\t\t\t\t\t</Decode>\n" +
                "\t\t\t\t\t<Alias Context=\"LOINC\" Name=\"LA9933-8\"/>\n" +
                "\t\t\t\t</CodeListItem>\n" +
                "\t\t\t</CodeList>\n" +
                "\t\t</MetaDataVersion>\n" +
                "\t</Study>\n" +
                "</ODM>".replaceAll("\\s+","")));

    }
}
