package gov.nih.nlm.ninds.form;

/**
 * Created by huangs8 on 8/7/2015.
 */
public class Naming {
    String designation;
    String definition;
    String definitionFormat;
    String languageCode;
    Context context;

    @Override
    public String toString() {
        return "Naming{" +
                "designation='" + designation + '\'' +
                ", definition='" + definition + '\'' +
                ", definitionFormat='" + definitionFormat + '\'' +
                ", languageCode='" + languageCode + '\'' +
                ", context=" + context +
                '}';
    }
}
