package gov.nih.nlm.ninds.form;

public class NindsFormRunner {

    public static void main(String[] args) {

        int startingPage = 27;

        int nbOfThreads = 1;
        Thread[] t = new Thread[nbOfThreads];

        for (int i = 0; i < nbOfThreads; i++) {
            NindsFormLoader loader = new NindsFormLoader(i + startingPage, i + startingPage);
            t[i] = new Thread(loader);
        }

        for (Thread aT : t) {
            aT.start();
        }
        for (Thread aT : t) {
            try {
                aT.join();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        System.exit(0);
    }
}
