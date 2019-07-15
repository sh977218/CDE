import { getStream as deGetStream } from '../server/cde/mongo-cde';
import { getStream as formGetStream } from '../server/form/mongo-form';
import { getStream as boardGetStream } from '../server/board/boardDb';

let done = 0;

let run = async function() {
    let cdeCursor = deGetStream({tinyId: /-/});

    for (let cde = await cdeCursor.next(); cde != null; cde = await cdeCursor.next()) {
        cde.tinyId = cde.tinyId.replace(/-/g, "_");
        await cde.save();
        if (done++ % 50 === 0) {
            // await new Promise(r => setTimeout(r, 2000));
            console.log(done);
        }
    }

    console.log("fixed " + done + " cdes");

    done = 0;
    let formCursor = formGetStream({});
    for (let form = await formCursor.next(); form != null; form = await formCursor.next()) {
        replaceIds(form);
        await form.save();
        if (done++ % 50 === 0) {
            await new Promise(r => setTimeout(r, 1000));
            console.log(done);
        }
    }

    console.log("fixed " + done + " forms");

    done = 0;
    let boardCursor = boardGetStream({});
    for (let board = await boardCursor.next(); board != null; board = await boardCursor.next()) {
        board.pins.forEach(p => p.tinyId = p.tinyId.replace(/-/g, "_"));
        await board.save();
        done++;
    }
    console.log("fixed " + done + " boards");

    process.exit(0);

};

run();

function replaceIds(fe) {
    if (fe.formElements) {
        fe.formElements.forEach(fee => {
            if (fee.elementType === 'question') {
                fee.question.cde.tinyId.replace(/-/g, "_");
            }
            else replaceIds(fee);
        });
    }
}
