import {parseValueDomain} from 'ingester/phenx/redCap/parseValueDomain';

// tslint:disable-next-line:variable-name
const data_type_number_variable_name_list = ['c_head_circ_percentile', 'c_height_percentile', 'c_height_cm', 'c_weight_percentile', 'c_sits_age_months', 'e_ver_age', 'e_mrs_age', 'e_baer_age', 'c_walk_age_months', 'e_ct_age', 'c_speaking_age_months', 'e_eeg_age', 'e_spinal_tap_age', 'e_nerve_conduction_age', 'e_muscle_biopsy_age', 'd_stumbling_age', 'd_stiffness_age', 'e_mri_brain_age', 'd_seizures_age', 'a_age_diagnosed_in_months', 'e_nerve_biopsy_age', 'e_mri_spine_age', 'd_arching_age', 'a_age_diagnosed_comments', 'd_unsteady_gait_age', 'd_fisted_hand_age', 'd_poor_feeding_age', 'd_stopped_smiling_age', 'd_loss_of_hearing_age', 'd_feeding_tube_age', 'a_symp_appear_age_in_months', 'd_loss_of_vision_age', 'd_change_in_gait_age', 'd_crying_irritability_age', 'censor_age', 'd_poor_head_control_age', 'd_apnea_age', 'd_onesided_weakness_age', 'd_cardiac_arrhythmias_age'];

export function parseNichdValueDomain(row: any) {
    const variableName = row['Variable / Field Name'];
    const valueDomain = parseValueDomain(row);
    if (valueDomain.datatype === 'Value List' && valueDomain.permissibleValues.length === 1) {
        valueDomain.permissibleValues.push({
            permissibleValue: '2',
            valueMeaningName: 'No'
        });
        console.log(`${variableName} corrected PV, added PV 2 No`);
    }
    if (data_type_number_variable_name_list.includes(variableName)) {
        if (valueDomain.datatype !== 'Number') {
            valueDomain.datatype = 'Number';
            console.log(`${variableName} corrected datatype to Number`);
        }
    }
    return valueDomain;
}
