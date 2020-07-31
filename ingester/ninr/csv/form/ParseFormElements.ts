import { parseFormElements } from 'ingester/ninds/csv/form/ParseFormElements';

export async function parseNinrFormElements(ninrForm, ninrRows) {
    await parseFormElements(ninrForm, ninrRows);
}

