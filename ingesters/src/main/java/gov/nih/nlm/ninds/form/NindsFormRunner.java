package gov.nih.nlm.ninds.form;

public class NindsFormRunner {

    public static void main(String[] args) {
        Thread[] t = new Thread[1];

        NindsFormLoader runner1 = new NindsFormLoader(1, 27);
        t[0] = new Thread(runner1);

        for (int i = 0; i < t.length; i++) {
            t[i].start();
        }
        for (int i = 0; i < t.length; i++) {
            try {
                t[i].join();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }
}
