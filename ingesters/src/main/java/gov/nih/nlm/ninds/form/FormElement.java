package gov.nih.nlm.ninds.form;

import java.util.ArrayList;

/**
 * Created by huangs8 on 8/7/2015.
 */
public class FormElement {
    String elementType ="section";
    String label = "Main section";
    String instructions;
    String cardinality;
    String repeatsFor;
    String showIfExpression;
    Section section;
    Question question;
    ArrayList<FormElement> formElements = new ArrayList<FormElement>();
    SkipLogic skipLogic;
}
