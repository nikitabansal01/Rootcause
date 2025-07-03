"use strict";
/**
 * Hormone Health Assessment Scoring Logic
 * Analyzes user responses to determine potential hormone imbalances
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
exports.adjustScoresWithLabs = exports.scoreSymptoms = void 0;
/**
 * Score symptoms to determine hormone imbalances
 * @param userResponses - User survey responses
 * @param cyclePhase - Current cycle phase
 * @returns Analysis results with imbalances and confidence
 */
function scoreSymptoms(userResponses, cyclePhase) {
    var scores = {
        androgens: 0,
        progesterone: 0,
        estrogen: 0,
        thyroid: 0,
        cortisol: 0,
        insulin: 0
    };
    var explanations = [];
    var totalScore = 0;
    // Q1: Period regularity
    if (userResponses.q1_period === 'No period') {
        scores.androgens += 3;
        scores.estrogen += 2;
        explanations.push('Missing periods can indicate low estrogen or high androgens');
    }
    else if (userResponses.q1_period === 'No') {
        scores.progesterone += 2;
        explanations.push('Irregular periods often indicate progesterone deficiency');
    }
    // Q3: Menstrual flow
    if (userResponses.q3_flow === 'Heavy') {
        scores.estrogen += 3;
        explanations.push('Heavy periods can indicate estrogen dominance');
    }
    else if (userResponses.q3_flow === 'Light') {
        scores.estrogen += 2;
        explanations.push('Light periods may indicate low estrogen');
    }
    else if (userResponses.q3_flow === 'Painful') {
        scores.progesterone += 2;
        scores.estrogen += 1;
        explanations.push('Painful periods often indicate progesterone deficiency and inflammation');
    }
    // Q4: Symptoms (checkboxes)
    var symptoms = userResponses.q4_symptoms || [];
    if (symptoms.includes('Acne')) {
        scores.androgens += 3;
        explanations.push('Acne is strongly associated with high androgen levels');
    }
    if (symptoms.includes('Hair loss') || symptoms.includes('Hair thinning')) {
        scores.androgens += 2;
        scores.thyroid += 1;
        explanations.push('Hair loss can indicate high androgens or thyroid issues');
    }
    if (symptoms.includes('Bloating')) {
        // Only count bloating if not in luteal phase (normal PMS symptom)
        if (cyclePhase !== 'luteal') {
            scores.estrogen += 2;
            explanations.push('Bloating outside of PMS can indicate estrogen dominance');
        }
    }
    if (symptoms.includes('Breast tenderness')) {
        if (cyclePhase !== 'luteal') {
            scores.estrogen += 2;
            explanations.push('Breast tenderness outside of PMS can indicate estrogen dominance');
        }
    }
    // Q5: Energy levels
    if (userResponses.q5_energy === 'Morning fatigue') {
        scores.cortisol += 3;
        explanations.push('Morning fatigue often indicates cortisol/adrenal issues');
    }
    else if (userResponses.q5_energy === 'Afternoon crash') {
        scores.insulin += 2;
        scores.cortisol += 1;
        explanations.push('Afternoon crashes often indicate blood sugar/insulin issues');
    }
    else if (userResponses.q5_energy === 'Constant fatigue') {
        scores.thyroid += 3;
        scores.cortisol += 2;
        explanations.push('Constant fatigue strongly suggests thyroid or adrenal issues');
    }
    // Q6: Mood changes
    if (userResponses.q6_mood === 'Rage/anger') {
        scores.progesterone += 3;
        explanations.push('Rage and anger are classic signs of progesterone deficiency');
    }
    else if (userResponses.q6_mood === 'Irritable') {
        scores.progesterone += 2;
        explanations.push('Irritability can indicate progesterone deficiency');
    }
    else if (userResponses.q6_mood === 'Sad/depressed') {
        scores.thyroid += 2;
        scores.progesterone += 1;
        explanations.push('Depression can indicate thyroid issues or hormone imbalances');
    }
    // Q7: Food cravings
    var cravings = userResponses.q7_cravings || [];
    if (cravings.includes('Sugar')) {
        scores.insulin += 3;
        explanations.push('Sugar cravings strongly indicate insulin resistance');
    }
    if (cravings.includes('Chocolate')) {
        scores.progesterone += 2;
        explanations.push('Chocolate cravings often indicate progesterone deficiency');
    }
    if (cravings.includes('Salt')) {
        scores.cortisol += 2;
        explanations.push('Salt cravings can indicate adrenal/cortisol issues');
    }
    // Q8: Stress levels
    if (userResponses.q8_stress === 'High') {
        scores.cortisol += 3;
        scores.progesterone += 1;
        explanations.push('High stress increases cortisol and can deplete progesterone');
    }
    else if (userResponses.q8_stress === 'Moderate') {
        scores.cortisol += 1;
    }
    // Q9: Birth control
    if (userResponses.q9_birth_control === 'Recently stopped') {
        scores.androgens += 2;
        scores.estrogen += 1;
        explanations.push('Stopping birth control can cause temporary androgen rebound');
    }
    // Q10: Medical conditions
    var conditions = userResponses.q10_conditions || [];
    if (conditions.includes('PCOS')) {
        scores.androgens += 4;
        scores.insulin += 3;
        explanations.push('PCOS is characterized by high androgens and insulin resistance');
    }
    if (conditions.includes('PMDD')) {
        scores.progesterone += 3;
        explanations.push('PMDD is strongly linked to progesterone sensitivity');
    }
    if (conditions.includes('Hashimoto\'s')) {
        scores.thyroid += 4;
        explanations.push('Hashimoto\'s is an autoimmune thyroid condition');
    }
    // Calculate total score
    totalScore = Object.values(scores).reduce(function (sum, score) { return sum + score; }, 0);
    // Determine primary and secondary imbalances
    var sortedScores = Object.entries(scores)
        .sort(function (_a, _b) {
        var a = _a[1];
        var b = _b[1];
        return b - a;
    })
        .filter(function (_a) {
        var score = _a[1];
        return score > 0;
    });
    var primaryImbalance = sortedScores.length > 0 ? sortedScores[0][0] : null;
    var secondaryImbalances = sortedScores.slice(1, 3).map(function (_a) {
        var hormone = _a[0];
        return hormone;
    });
    // Calculate confidence level
    var confidenceLevel = 'low';
    if (totalScore >= 15) {
        confidenceLevel = 'high';
    }
    else if (totalScore >= 8) {
        confidenceLevel = 'medium';
    }
    // Reduce confidence if cycle phase is unknown
    if (cyclePhase === 'unknown') {
        confidenceLevel = confidenceLevel === 'high' ? 'medium' : 'low';
        explanations.push('Cycle phase unknown - some symptoms may be normal for your cycle phase');
    }
    // Add lab data analysis if available
    var labs = userResponses.q11_labs || {};
    var labAnalysis = analyzeLabValues(labs);
    // Convert string lab values to numbers for adjustment function
    var numericLabs = {};
    if (labs.free_t)
        numericLabs.freeTestosterone = parseFloat(labs.free_t);
    if (labs.dhea)
        numericLabs.dhea = parseFloat(labs.dhea);
    if (labs.lh)
        numericLabs.lh = parseFloat(labs.lh);
    if (labs.fsh)
        numericLabs.fsh = parseFloat(labs.fsh);
    if (labs.tsh)
        numericLabs.tsh = parseFloat(labs.tsh);
    if (labs.t3)
        numericLabs.t3 = parseFloat(labs.t3);
    if (labs.insulin)
        numericLabs.fastingInsulin = parseFloat(labs.insulin);
    if (labs.hba1c)
        numericLabs.hba1c = parseFloat(labs.hba1c);
    // Adjust scores based on lab data
    var _a = adjustScoresWithLabs(scores, numericLabs), adjustedScores = _a.adjustedScores, conflicts = _a.conflicts;
    // Update scores with adjusted values
    Object.assign(scores, adjustedScores);
    // Add lab analysis and conflicts to explanations
    if (labAnalysis.length > 0) {
        explanations.push.apply(explanations, labAnalysis);
    }
    if (conflicts.length > 0) {
        explanations.push.apply(explanations, conflicts);
    }
    // Increase confidence if lab data is available
    if (Object.keys(numericLabs).length > 0) {
        confidenceLevel = confidenceLevel === 'low' ? 'medium' : confidenceLevel;
        if (Object.keys(numericLabs).length >= 3) {
            confidenceLevel = confidenceLevel === 'medium' ? 'high' : confidenceLevel;
        }
    }
    return {
        primaryImbalance: primaryImbalance,
        secondaryImbalances: secondaryImbalances,
        confidenceLevel: confidenceLevel,
        explanations: explanations,
        scores: scores,
        totalScore: totalScore,
        cyclePhase: cyclePhase
    };
}
exports.scoreSymptoms = scoreSymptoms;
/**
 * Analyze lab values if provided
 * @param labs - Lab values object
 * @returns Array of lab-based explanations
 */
function analyzeLabValues(labs) {
    var explanations = [];
    if (labs.free_t && parseFloat(labs.free_t) > 2.1) {
        explanations.push('Elevated free testosterone suggests androgen excess');
    }
    if (labs.dhea && parseFloat(labs.dhea) > 350) {
        explanations.push('High DHEA can indicate adrenal stress or PCOS');
    }
    if (labs.lh && labs.fsh) {
        var lh = parseFloat(labs.lh);
        var fsh = parseFloat(labs.fsh);
        if (lh > 10 && fsh > 10) {
            explanations.push('Elevated LH and FSH suggest diminished ovarian reserve');
        }
        else if (lh / fsh > 2) {
            explanations.push('LH/FSH ratio >2 suggests PCOS');
        }
    }
    if (labs.tsh && parseFloat(labs.tsh) > 4.5) {
        explanations.push('Elevated TSH suggests hypothyroidism');
    }
    if (labs.insulin && parseFloat(labs.insulin) > 25) {
        explanations.push('High insulin suggests insulin resistance');
    }
    if (labs.hba1c && parseFloat(labs.hba1c) > 5.7) {
        explanations.push('Elevated HbA1c suggests blood sugar dysregulation');
    }
    return explanations;
}
/**
 * Adjust symptom-based scores using lab data for more accurate hormone imbalance detection
 * @param symptomScores - Scores calculated from symptoms
 * @param labs - Optional lab values
 * @returns Adjusted scores and any conflicts between symptoms and labs
 */
function adjustScoresWithLabs(symptomScores, labs) {
    var adjustedScores = __assign({}, symptomScores);
    var conflicts = [];
    // Reference ranges for lab values
    var referenceRanges = {
        freeTestosterone: { low: 0.1, high: 2.1, unit: 'ng/dL' },
        dhea: { low: 35, high: 350, unit: 'μg/dL' },
        lh: { low: 2.4, high: 12.6, unit: 'mIU/mL' },
        fsh: { low: 3.5, high: 12.5, unit: 'mIU/mL' },
        tsh: { low: 0.4, high: 4.5, unit: 'μIU/mL' },
        t3: { low: 2.3, high: 4.2, unit: 'pg/mL' },
        fastingInsulin: { low: 3, high: 25, unit: 'μIU/mL' },
        hba1c: { low: 4.0, high: 5.6, unit: '%' }
    };
    // Free Testosterone Analysis
    if (labs.freeTestosterone !== undefined) {
        var value = labs.freeTestosterone;
        if (value > referenceRanges.freeTestosterone.high) {
            // High testosterone confirms androgen symptoms
            if (symptomScores.androgens > 0) {
                adjustedScores.androgens += 2; // Boost androgen score
                conflicts.push("Lab confirms high testosterone (".concat(value, " ").concat(referenceRanges.freeTestosterone.unit, ") - strengthens androgen imbalance assessment"));
            }
            else {
                // High testosterone but no symptoms - potential subclinical issue
                adjustedScores.androgens += 1;
                conflicts.push("High testosterone (".concat(value, " ").concat(referenceRanges.freeTestosterone.unit, ") detected despite minimal symptoms - consider subclinical androgen excess"));
            }
        }
        else if (value < referenceRanges.freeTestosterone.low) {
            // Low testosterone conflicts with androgen symptoms
            if (symptomScores.androgens > 3) {
                adjustedScores.androgens -= 2; // Reduce androgen score
                conflicts.push("Low testosterone (".concat(value, " ").concat(referenceRanges.freeTestosterone.unit, ") conflicts with androgen symptoms - may indicate different underlying cause"));
            }
        }
    }
    // DHEA Analysis
    if (labs.dhea !== undefined) {
        var value = labs.dhea;
        if (value > referenceRanges.dhea.high) {
            // High DHEA can indicate adrenal stress or PCOS
            if (symptomScores.cortisol > 0) {
                adjustedScores.cortisol += 1; // Boost cortisol score
                conflicts.push("High DHEA (".concat(value, " ").concat(referenceRanges.dhea.unit, ") suggests adrenal stress - supports cortisol imbalance"));
            }
            if (symptomScores.androgens > 0) {
                adjustedScores.androgens += 1; // Boost androgen score
                conflicts.push("High DHEA (".concat(value, " ").concat(referenceRanges.dhea.unit, ") can contribute to androgen excess"));
            }
        }
        else if (value < referenceRanges.dhea.low) {
            // Low DHEA suggests adrenal fatigue
            if (symptomScores.cortisol > 0) {
                adjustedScores.cortisol += 1; // Boost cortisol score for adrenal fatigue
                conflicts.push("Low DHEA (".concat(value, " ").concat(referenceRanges.dhea.unit, ") suggests adrenal fatigue - supports cortisol imbalance"));
            }
        }
    }
    // LH/FSH Ratio Analysis
    if (labs.lh !== undefined && labs.fsh !== undefined) {
        var lh = labs.lh;
        var fsh = labs.fsh;
        var ratio = lh / fsh;
        if (ratio > 2) {
            // LH/FSH ratio >2 suggests PCOS
            if (symptomScores.androgens > 0) {
                adjustedScores.androgens += 2; // Strongly boost androgen score
                conflicts.push("LH/FSH ratio of ".concat(ratio.toFixed(1), " strongly suggests PCOS - significantly strengthens androgen imbalance assessment"));
            }
            if (symptomScores.insulin > 0) {
                adjustedScores.insulin += 1; // Boost insulin score
                conflicts.push("PCOS pattern (LH/FSH ratio ".concat(ratio.toFixed(1), ") typically involves insulin resistance"));
            }
        }
        else if (lh > 10 && fsh > 10) {
            // Elevated LH and FSH suggest diminished ovarian reserve
            if (symptomScores.estrogen > 0) {
                adjustedScores.estrogen += 1; // Boost estrogen score
                conflicts.push("Elevated LH (".concat(lh, ") and FSH (").concat(fsh, ") suggest diminished ovarian reserve - may indicate low estrogen"));
            }
        }
    }
    // Thyroid Analysis
    if (labs.tsh !== undefined) {
        var value = labs.tsh;
        if (value > referenceRanges.tsh.high) {
            // High TSH indicates hypothyroidism
            if (symptomScores.thyroid > 0) {
                adjustedScores.thyroid += 2; // Strongly boost thyroid score
                conflicts.push("Elevated TSH (".concat(value, " ").concat(referenceRanges.tsh.unit, ") confirms hypothyroidism - significantly strengthens thyroid imbalance assessment"));
            }
            else {
                // High TSH but no thyroid symptoms - subclinical hypothyroidism
                adjustedScores.thyroid += 1;
                conflicts.push("Elevated TSH (".concat(value, " ").concat(referenceRanges.tsh.unit, ") detected despite minimal symptoms - consider subclinical hypothyroidism"));
            }
        }
        else if (value < referenceRanges.tsh.low) {
            // Low TSH suggests hyperthyroidism
            if (symptomScores.thyroid > 0) {
                adjustedScores.thyroid -= 1; // Reduce thyroid score for hypothyroidism symptoms
                conflicts.push("Low TSH (".concat(value, " ").concat(referenceRanges.tsh.unit, ") suggests hyperthyroidism - conflicts with hypothyroid symptoms"));
            }
        }
    }
    // T3 Analysis
    if (labs.t3 !== undefined) {
        var value = labs.t3;
        if (value < referenceRanges.t3.low) {
            // Low T3 suggests hypothyroidism
            if (symptomScores.thyroid > 0) {
                adjustedScores.thyroid += 1; // Boost thyroid score
                conflicts.push("Low T3 (".concat(value, " ").concat(referenceRanges.t3.unit, ") supports thyroid dysfunction"));
            }
        }
    }
    // Insulin Analysis
    if (labs.fastingInsulin !== undefined) {
        var value = labs.fastingInsulin;
        if (value > referenceRanges.fastingInsulin.high) {
            // High insulin indicates insulin resistance
            if (symptomScores.insulin > 0) {
                adjustedScores.insulin += 2; // Strongly boost insulin score
                conflicts.push("High fasting insulin (".concat(value, " ").concat(referenceRanges.fastingInsulin.unit, ") confirms insulin resistance - significantly strengthens insulin imbalance assessment"));
            }
            else {
                // High insulin but no symptoms - subclinical insulin resistance
                adjustedScores.insulin += 1;
                conflicts.push("High fasting insulin (".concat(value, " ").concat(referenceRanges.fastingInsulin.unit, ") detected despite minimal symptoms - consider subclinical insulin resistance"));
            }
        }
        else if (value < referenceRanges.fastingInsulin.low) {
            // Low insulin conflicts with insulin resistance symptoms
            if (symptomScores.insulin > 3) {
                adjustedScores.insulin -= 1; // Reduce insulin score
                conflicts.push("Low fasting insulin (".concat(value, " ").concat(referenceRanges.fastingInsulin.unit, ") conflicts with insulin resistance symptoms"));
            }
        }
    }
    // HbA1c Analysis
    if (labs.hba1c !== undefined) {
        var value = labs.hba1c;
        if (value > referenceRanges.hba1c.high) {
            // Elevated HbA1c indicates blood sugar dysregulation
            if (symptomScores.insulin > 0) {
                adjustedScores.insulin += 1; // Boost insulin score
                conflicts.push("Elevated HbA1c (".concat(value).concat(referenceRanges.hba1c.unit, ") confirms blood sugar dysregulation - supports insulin imbalance"));
            }
        }
    }
    // Ensure no negative scores
    Object.keys(adjustedScores).forEach(function (key) {
        if (adjustedScores[key] < 0) {
            adjustedScores[key] = 0;
        }
    });
    return {
        adjustedScores: adjustedScores,
        conflicts: conflicts
    };
}
exports.adjustScoresWithLabs = adjustScoresWithLabs;
