package gov.nih.nlm.ninds.form;

import java.util.ArrayList;

/**
 * Created by huangs8 on 8/7/2015.
 */
public class Question {
    Cde cde;
    String datatype;
    ArrayList<String> uoms = new ArrayList<String>();
    Boolean required;
    Boolean multiselect;
    OtherPleaseSpecify otherPleaseSpecify;
    ArrayList<PermissibleValue> answers = new ArrayList<PermissibleValue>();
}
