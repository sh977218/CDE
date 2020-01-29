import { formModel } from 'server/form/mongo-form';
import { fixFormError } from 'ingester/shared/form';
import { forEach } from 'async';

process.on('unhandledRejection', error => {
    console.log(error);
});

function run() {
    let formCount = 0;
    const idsToFix = ['5799136f8a02bdb90feddcfa', '5799137c8a02bdb90feddd48', '5799137d8a02bdb90feddd4c', '5799137e8a02bdb90feddd50', '57d05f6e1df0df0c3f12d9f3', '57dae51cbc6f0dfc32254232', '57dae51cbc6f0dfc32254233', '57dae51dbc6f0dfc32254234', '57dae51ebc6f0dfc32254235', '57dae51ebc6f0dfc32254236', '57dae51ebc6f0dfc32254237', '57dae51fbc6f0dfc32254238', '57dae51fbc6f0dfc32254239', '57dae520bc6f0dfc3225423a', '57dae55f38d8ec8c34efdff8', '57dae56038d8ec8c34efdff9', '57dae56138d8ec8c34efdffa', '57dae56138d8ec8c34efdffb', '57dae56138d8ec8c34efdffc', '57dae56138d8ec8c34efdffd', '57dae56238d8ec8c34efdffe', '57dae56538d8ec8c34efe001', '57dae56538d8ec8c34efe002', '57dae56638d8ec8c34efe003', '57dae56638d8ec8c34efe004', '57dae56638d8ec8c34efe005', '57dae56638d8ec8c34efe006', '57dae56738d8ec8c34efe008', '57dae56738d8ec8c34efe009', '57dae56738d8ec8c34efe00a', '57dae56738d8ec8c34efe00b', '57dae56838d8ec8c34efe00c', '57dae56838d8ec8c34efe00d', '57dae56838d8ec8c34efe00e', '57dae56838d8ec8c34efe00f', '57dae56938d8ec8c34efe010', '57dae56a38d8ec8c34efe011', '57dae56a38d8ec8c34efe012', '57dae56a38d8ec8c34efe013', '5807c64f6c7c6084528e1b1c', '5807c64f6c7c6084528e1b1d', '5807c64f6c7c6084528e1b1e', '5807c6506c7c6084528e1b1f', '5807c6506c7c6084528e1b20', '584f13080962fc6f724a6edf', '585c025c5552a58c2c8b00e7', '585c02615552a58c2c8b0101', '585c02635552a58c2c8b0108', '585c03785552a58c2c8b067d', '585c03785552a58c2c8b067e', '585c03795552a58c2c8b0680', '585c03795552a58c2c8b0682', '58754fad7f5fc7ab35d7d383', '58f65a653135f763072d3b66', '590a2bdc906fed7b15b83ad5', '590a2e40906fed7b15b83b7c', '590a2f83906fed7b15b83bfc', '593e9fa3886e3b123727f060', '593ea56b886e3b123727f186', '59665807eaf0d858e33faac1', '598db74c3b40d4203ef7bfa2', '59aec7b51e08ee3087fcc64f', '59ce9dfef5d8c2089f317b9f', '59ce9e4e86b7c008a257b580', '59cea3ad86b7c008a257bae5', '59cea3dff5d8c2089f31817a', '59cea406f5d8c2089f3181af', '59cea48a86b7c008a257bbd5', '59cea7993b7294085c26040b', '59cea9673b7294085c2605d5', '59ceaa2eeec265085f9379cb', '59ceaad6eec265085f937a7a', '59ceab653b7294085c2607de', '59fa191ed41ef60981a85ae1', '59fb41e2217173096001c3ca', '59fb5caa217173096001db8d', '5a0205659a8f0d0938b49366', '5a1ed3f4806b2809435626ba', '5a32d22439c90108ebc20cda', '5a6905872183ec0981ea598a', '5a6a46b92183ec0981eb7998', '5a71ee317d593f09461465fe', '5a7b4580900d330976001b98', '5a7bcc2b900d330976009517', '5a8d9aac2fbaee09b14e6a78', '5aa9436a1dd89f099771fdc7', '5ad76ad4d449260994a8fc70', '5b02e87efa3b4f0a9dc19f6f', '5bb3983fbecd0108756f446b', '5bb39983becd0108756f44c0', '5bb39a6bbecd0108756f44f0', '5bb39b06becd0108756f4526', '5bb39b67becd0108756f4559', '5bb39bc2becd0108756f4579', '5bb39c18becd0108756f45a9', '5bb39c7ebecd0108756f45c8', '5bb39cbabecd0108756f45f6', '5bb39cffbecd0108756f4613', '5bb39d38becd0108756f463b', '5bb39d65becd0108756f4655', '5bb39da2becd0108756f4683', '5bb39de9becd0108756f469a', '5bb39e3dbecd0108756f46c6', '5bb39ea6becd0108756f46eb', '5bb39eedbecd0108756f4715', '5bb39f34becd0108756f4732', '5bb39f60becd0108756f475c', '5bb39fafbecd0108756f4774', '5bb39ff3becd0108756f47a5', '5bb3a037becd0108756f47d0', '5bb3a074becd0108756f4802', '5bb3a0d9becd0108756f4822', '5bb3a572b36e7a08ff857ee7', '5bb3a68bb36e7a08ff857f20', '5bb3a724b36e7a08ff857f5a', '5bb3a7ccb36e7a08ff857f7f', '5bb3a906b36e7a08ff857fc0', '5bb3a98eb36e7a08ff857fe4', '5bb3b073b36e7a08ff85810e', '5bb3b15bb36e7a08ff858148', '5bb3b195b36e7a08ff85818a', '5bb3b1fbb36e7a08ff8581a5', '5bb3b39cb36e7a08ff858222', '5bb3b40ab36e7a08ff858260', '5bb3b4fcb36e7a08ff858295', '5bb3b550b36e7a08ff8582c3', '5bb3b5a9b36e7a08ff8582e1', '5bb3b5ffb36e7a08ff858319', '5bb3b81bb36e7a08ff85837a', '5bb3b873b36e7a08ff858399', '5bb3b8b5b36e7a08ff8583b6', '5bc8d97505f44708e334688b', '5bd9ff46642129095d1e59fb', '5bd9ff7d642129095d1e5a08'];
    console.log(`idsToFix.length: ${idsToFix.length}`);
    forEach(idsToFix, (idToFix, doneOne) => {
        formModel.findById(idToFix, async (err, form) => {
            if (err) {
                throw err;
            } else {
                form.lastMigrationScript = 'mongoose validation';
                await fixFormError(form);
                await form.save().catch(error => {
                    console.log(`await form.save() Error ${error}`);
                });
                formCount++;
                console.log(`formCount: ${formCount}`);
                doneOne();
            }
        });
    }, err => {
        if (err) {
            throw err;
        }
        console.log('finished.');
        process.exit(0);
    });
}

run();
