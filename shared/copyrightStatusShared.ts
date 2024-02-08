import { CopyrightStatus } from './models.model';

export const copyrightStatusList: { name: CopyrightStatus; help: string; curHelp: string }[] = [
    {
        name: 'Public domain, free to use',
        help: 'Public domain, free to use',
        curHelp: 'Public domain, free to use',
    },
    {
        name: 'Copyrighted, but free to use',
        help: 'Copyrighted, but free to use',
        curHelp: 'copyrighted false',
    },
    {
        name: 'Copyrighted, with restrictions',
        help: 'NLM does not have permission to display these, but provides links to more information when available',
        curHelp: 'copyrighted false',
    },
];
