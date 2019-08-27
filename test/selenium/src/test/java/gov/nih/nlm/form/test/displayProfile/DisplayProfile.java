package gov.nih.nlm.form.test.displayProfile;

public class DisplayProfile {
    public int displayProfileIndex;
    public String displayProfileName;
    public String displayProfileType;
    public int numberOfColumn;
    public int answerDropdownLimit;
    public boolean displayAsMatrix;
    public boolean displayAnswerValue;
    public boolean displayInstruction;
    public boolean displayQuestionNumber;
    public boolean displayInvisible;
    public boolean displayMetadataDevice;

    public DisplayProfile(int displayProfileIndex, String displayProfileName, String displayProfileType, int numberOfColumn, int answerDropdownLimit, boolean displayAsMatrix, boolean displayAnswerValue, boolean displayInstruction, boolean displayQuestionNumber, boolean displayInvisible, boolean displayMetadataDevice) {
        this.displayProfileIndex = displayProfileIndex;
        this.displayProfileName = displayProfileName;
        this.displayProfileType = displayProfileType;
        this.numberOfColumn = numberOfColumn;
        this.answerDropdownLimit = answerDropdownLimit;
        this.displayAsMatrix = displayAsMatrix;
        this.displayAnswerValue = displayAnswerValue;
        this.displayInstruction = displayInstruction;
        this.displayQuestionNumber = displayQuestionNumber;
        this.displayInvisible = displayInvisible;
        this.displayMetadataDevice = displayMetadataDevice;
    }
}