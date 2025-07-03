"use strict";
/**
 * Test file to demonstrate adjustScoresWithLabs function
 * This shows how lab data can refine hormone imbalance detection
 */
exports.__esModule = true;
var scoring_1 = require("./scoring");
// Example 1: High testosterone symptoms with confirming lab data
console.log('=== Example 1: High Testosterone Symptoms + Confirming Labs ===');
var androgenSymptoms = {
    androgens: 5,
    progesterone: 0,
    estrogen: 0,
    thyroid: 0,
    cortisol: 0,
    insulin: 0
};
var confirmingLabs = {
    freeTestosterone: 3.2,
    dhea: 400 // High (normal: 35-350 μg/dL)
};
var result1 = (0, scoring_1.adjustScoresWithLabs)(androgenSymptoms, confirmingLabs);
console.log('Original scores:', androgenSymptoms);
console.log('Adjusted scores:', result1.adjustedScores);
console.log('Conflicts:', result1.conflicts);
// Example 2: Thyroid symptoms with conflicting lab data
console.log('\n=== Example 2: Thyroid Symptoms + Conflicting Labs ===');
var thyroidSymptoms = {
    androgens: 0,
    progesterone: 0,
    estrogen: 0,
    thyroid: 6,
    cortisol: 0,
    insulin: 0
};
var conflictingLabs = {
    tsh: 0.2,
    t3: 5.0 // High T3 (normal: 2.3-4.2 pg/mL)
};
var result2 = (0, scoring_1.adjustScoresWithLabs)(thyroidSymptoms, conflictingLabs);
console.log('Original scores:', thyroidSymptoms);
console.log('Adjusted scores:', result2.adjustedScores);
console.log('Conflicts:', result2.conflicts);
// Example 3: PCOS pattern with LH/FSH ratio
console.log('\n=== Example 3: PCOS Pattern + LH/FSH Ratio ===');
var pcosSymptoms = {
    androgens: 3,
    progesterone: 0,
    estrogen: 0,
    thyroid: 0,
    cortisol: 0,
    insulin: 2 // Some insulin resistance symptoms
};
var pcosLabs = {
    lh: 15,
    fsh: 6,
    fastingInsulin: 30 // High insulin (normal: 3-25 μIU/mL)
};
var result3 = (0, scoring_1.adjustScoresWithLabs)(pcosSymptoms, pcosLabs);
console.log('Original scores:', pcosSymptoms);
console.log('Adjusted scores:', result3.adjustedScores);
console.log('Conflicts:', result3.conflicts);
// Example 4: Subclinical issues (labs abnormal but minimal symptoms)
console.log('\n=== Example 4: Subclinical Issues ===');
var minimalSymptoms = {
    androgens: 0,
    progesterone: 0,
    estrogen: 0,
    thyroid: 0,
    cortisol: 0,
    insulin: 0
};
var subclinicalLabs = {
    tsh: 6.0,
    fastingInsulin: 28 // High insulin (insulin resistance)
};
var result4 = (0, scoring_1.adjustScoresWithLabs)(minimalSymptoms, subclinicalLabs);
console.log('Original scores:', minimalSymptoms);
console.log('Adjusted scores:', result4.adjustedScores);
console.log('Conflicts:', result4.conflicts);
