import { CurationStatus } from 'shared/models.model';

// @TODO refactor this to = {'pref standard': {help: '', curHelp: ''}}
export const statusList: { name: CurationStatus; help: string; curHelp: string }[] = [
    {
        name: 'Preferred Standard',
        help:
            'Preferred Standard elements are managed by the CDE Working Group and described by Meaninful Use terminology. <br/>' +
            'Preferred Standard elements can only be edited by the CDE Working Group',
        curHelp: 'Preferred Standard elements cannot be edited by their stewards',
    },
    {
        name: 'Standard',
        help: 'Standard elements are managed by the CDE Working Group. Standard elements can only be editied by the CDE Working Group.',
        curHelp: 'Standard elements cannot be edited by their stewards',
    },
    {
        name: 'Qualified',
        help: 'Qualified elements are managed by their Stewards and may be eligible to become Standard.',
        curHelp: 'Qualified elements should be well defined and are visible to the public by default.',
    },
    {
        name: 'Recorded',
        help: 'Recorded elements are managed by their Stewards and indicate elements that have not yet been Qualified to become Standard.',
        curHelp: 'Recorded elements are not visible by default.',
    },
    {
        name: 'Candidate',
        help: 'Candidate elements are managed by their Stewards and indicate elements that are still under work to become Recorded.',
        curHelp: 'Candidate elements are not visible by default.',
    },
    {
        name: 'Incomplete',
        help: 'Incomplete elements are managed by their Stewards and indicate elements that are not competely defined. ',
        curHelp:
            'Incomplete indicates an element that is not fully defined. Incomplete elements are not visible by default.',
    },
    {
        name: 'Retired',
        help: 'Retired elements are not visible in searches. Indicates elements that are no longer used or superceded by another element.',
        curHelp: 'Retired elements are not returned in searches',
    },
];

export const orderedList: CurationStatus[] = statusList.map(e => e.name);
