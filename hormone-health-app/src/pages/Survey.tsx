import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { scoreSymptoms } from '../logic/hormones/scoring';
import { getCyclePhase } from '../logic/hormones/cycleUtils';
import { SurveyResponses, Question } from '../types';
import QuestionBlock from '../components/QuestionBlock';
import RadioGroup from '../components/RadioGroup';
import CheckboxGroup from '../components/CheckboxGroup';
import styles from './Survey.module.css';

const Survey: React.FC = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showLabs, setShowLabs] = useState(false);
  const [answers, setAnswers] = useState<SurveyResponses>({
    q1_period: '',
    q1_cycle_length: '',
    q2_last_period: '',
    q2_dont_remember: false,
    q3_flow: '',
    q4_symptoms: [],
    q5_energy: '',
    q6_mood: '',
    q7_cravings: [],
    q8_stress: '',
    q9_birth_control: '',
    q10_conditions: [],
    q11_labs: {
      free_t: '',
      dhea: '',
      lh: '',
      fsh: '',
      tsh: '',
      t3: '',
      insulin: '',
      hba1c: ''
    }
  });

  const questions: Question[] = [
    {
      id: 'q1_period',
      question: 'Do you currently have regular menstrual periods?',
      type: 'radio',
      options: ['Yes', 'No', 'No period']
    },
    {
      id: 'q1_cycle_length',
      question: 'What is your average cycle length in days?',
      type: 'number',
      conditional: 'q1_period',
      conditionalValue: 'Yes'
    },
    {
      id: 'q2_last_period',
      question: 'When was your last menstrual period?',
      type: 'date',
      hasDontRemember: true
    },
    {
      id: 'q3_flow',
      question: 'How would you describe your typical menstrual flow?',
      type: 'radio',
      options: ['Normal', 'Heavy', 'Light', 'Painful']
    },
    {
      id: 'q4_symptoms',
      question: 'Which of the following symptoms do you experience? (Select all that apply)',
      type: 'checkbox',
      options: ['Acne', 'Hair loss', 'Hair thinning', 'Bloating', 'Breast tenderness', 'None of the above']
    },
    {
      id: 'q5_energy',
      question: 'How would you describe your energy levels throughout the day?',
      type: 'radio',
      options: ['Steady energy', 'Morning fatigue', 'Afternoon crash', 'Constant fatigue']
    },
    {
      id: 'q6_mood',
      question: 'How do your hormones affect your mood?',
      type: 'radio',
      options: ['No change', 'Irritable', 'Sad/depressed', 'Rage/anger']
    },
    {
      id: 'q7_cravings',
      question: 'What types of food do you crave? (Select all that apply)',
      type: 'checkbox',
      options: ['Sugar', 'Salt', 'Chocolate', 'None']
    },
    {
      id: 'q8_stress',
      question: 'How would you rate your current stress level?',
      type: 'radio',
      options: ['Low', 'Moderate', 'High']
    },
    {
      id: 'q9_birth_control',
      question: 'Are you currently using hormonal birth control?',
      type: 'radio',
      options: ['No', 'Currently using', 'Recently stopped']
    },
    {
      id: 'q10_conditions',
      question: 'Do you have any of the following conditions? (Select all that apply)',
      type: 'checkbox',
      options: ['PCOS', 'Endometriosis', 'PMDD', 'Hashimoto\'s', 'None of the above']
    }
  ];

  const handleRadioChange = (questionId: string, value: string) => {
    setAnswers((prev: SurveyResponses) => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleCheckboxChange = (questionId: string, values: string[]) => {
    setAnswers((prev: SurveyResponses) => ({
      ...prev,
      [questionId]: values
    }));
  };

  const handleNumberChange = (questionId: string, value: string) => {
    setAnswers((prev: SurveyResponses) => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleDateChange = (value: string) => {
    setAnswers((prev: SurveyResponses) => ({
      ...prev,
      q2_last_period: value
    }));
  };

  const handleDontRememberChange = (checked: boolean) => {
    setAnswers((prev: SurveyResponses) => ({
      ...prev,
      q2_dont_remember: checked
    }));
  };

  const handleLabChange = (labKey: string, value: string) => {
    setAnswers((prev: SurveyResponses) => ({
      ...prev,
      q11_labs: {
        ...prev.q11_labs,
        [labKey]: value
      }
    }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev: number) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev: number) => prev - 1);
    }
  };

  const handleSubmit = () => {
    // Calculate cycle phase
    const isRegular = answers.q1_period === 'Yes';
    const cycleLength = answers.q1_cycle_length ? parseInt(answers.q1_cycle_length) : 28;
    const cyclePhase = getCyclePhase(answers.q2_last_period, isRegular, cycleLength);
    
    // Score symptoms and get analysis
    const analysis = scoreSymptoms(answers, cyclePhase);

    // Prepare lab values for adjustment
    const labs = answers.q11_labs || {};
    const numericLabs: {
      freeTestosterone?: number;
      dhea?: number;
      lh?: number;
      fsh?: number;
      tsh?: number;
      t3?: number;
      fastingInsulin?: number;
      hba1c?: number;
    } = {};
    if (labs.free_t) numericLabs.freeTestosterone = parseFloat(labs.free_t);
    if (labs.dhea) numericLabs.dhea = parseFloat(labs.dhea);
    if (labs.lh) numericLabs.lh = parseFloat(labs.lh);
    if (labs.fsh) numericLabs.fsh = parseFloat(labs.fsh);
    if (labs.tsh) numericLabs.tsh = parseFloat(labs.tsh);
    if (labs.t3) numericLabs.t3 = parseFloat(labs.t3);
    if (labs.insulin) numericLabs.fastingInsulin = parseFloat(labs.insulin);
    if (labs.hba1c) numericLabs.hba1c = parseFloat(labs.hba1c);

    // Adjust scores with labs if any lab is present
    let finalScores = analysis.scores;
    let conflicts: string[] = [];
    if (Object.values(numericLabs).some(v => v !== undefined && !isNaN(v))) {
      const adjustResult = require('../logic/hormones/scoring').adjustScoresWithLabs(finalScores, numericLabs);
      finalScores = adjustResult.adjustedScores;
      conflicts = adjustResult.conflicts;
    }

    // Build explanations by hormone (example logic, can be improved)
    const explanationsByHormone: Record<string, string> = {};
    (analysis.explanations || []).forEach(exp => {
      if (exp.toLowerCase().includes('androgen')) explanationsByHormone['androgens'] = exp;
      if (exp.toLowerCase().includes('insulin')) explanationsByHormone['insulin'] = exp;
      if (exp.toLowerCase().includes('progesterone')) explanationsByHormone['progesterone'] = exp;
      if (exp.toLowerCase().includes('estrogen')) explanationsByHormone['estrogen'] = exp;
      if (exp.toLowerCase().includes('thyroid')) explanationsByHormone['thyroid'] = exp;
      if (exp.toLowerCase().includes('cortisol')) explanationsByHormone['cortisol'] = exp;
    });

    // Build result object
    const result = {
      cyclePhase,
      confidence: analysis.confidenceLevel,
      primaryImbalance: analysis.primaryImbalance,
      secondaryImbalances: analysis.secondaryImbalances,
      explanations: explanationsByHormone,
      conflicts
    };

    // Navigate to results with the result object
    navigate('/results', { state: { result } });
  };

  const currentQ = questions[currentQuestion];
  
  // Check if current question should be shown based on conditional logic
  const shouldShowQuestion = (question: Question) => {
    if (!question.conditional) return true;
    
    const conditionalAnswer = answers[question.conditional as keyof SurveyResponses];
    return conditionalAnswer === question.conditionalValue;
  };

  // Filter questions based on conditional logic
  const visibleQuestions = questions.filter(shouldShowQuestion);
  const currentVisibleIndex = visibleQuestions.findIndex(q => q.id === currentQ.id);
  const actualProgress = ((currentVisibleIndex + 1) / visibleQuestions.length) * 100;

  const canProceed = () => {
    const currentAnswer = answers[currentQ.id as keyof SurveyResponses];
    if (currentQ.type === 'radio') {
      return currentAnswer !== '';
    } else if (currentQ.type === 'checkbox') {
      return Array.isArray(currentAnswer) && currentAnswer.length > 0;
    } else if (currentQ.type === 'date') {
      return answers.q2_last_period !== '' || answers.q2_dont_remember;
    } else if (currentQ.type === 'number') {
      // For cycle length, it's optional so always allow proceeding
      return true;
    }
    return false;
  };

  const renderQuestion = () => {
    switch (currentQ.type) {
      case 'radio':
        return (
          <RadioGroup
            options={currentQ.options || []}
            selectedValue={answers[currentQ.id as keyof SurveyResponses] as string}
            onChange={(value) => handleRadioChange(currentQ.id, value)}
            name={currentQ.id}
          />
        );

      case 'checkbox':
        return (
          <CheckboxGroup
            options={currentQ.options || []}
            selectedValues={answers[currentQ.id as keyof SurveyResponses] as string[]}
            onChange={(values) => handleCheckboxChange(currentQ.id, values)}
            name={currentQ.id}
          />
        );

      case 'number':
        return (
          <div className={styles.numberContainer}>
            <input
              type="number"
              className={styles.numberInput}
              value={String(answers[currentQ.id as keyof SurveyResponses] || '')}
              onChange={(e) => handleNumberChange(currentQ.id, e.target.value)}
              placeholder="Enter number of days"
              min="21"
              max="45"
            />
            <p className={styles.helperText}>
              Optional - will default to 28 days if not specified
            </p>
          </div>
        );

      case 'date':
        return (
          <div className={styles.dateContainer}>
            <input
              type="date"
              className={styles.dateInput}
              value={answers.q2_last_period}
              onChange={(e) => handleDateChange(e.target.value)}
              disabled={answers.q2_dont_remember}
            />
            <label className={styles.checkboxOption}>
              <input
                type="checkbox"
                checked={answers.q2_dont_remember}
                onChange={(e) => handleDontRememberChange(e.target.checked)}
              />
              <span className={styles.checkboxLabel}>I don't remember</span>
            </label>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Hormone Health Survey</h1>
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill} 
            style={{ width: `${actualProgress}%` }}
          ></div>
        </div>
        <p className={styles.progressText}>
          Question {currentVisibleIndex + 1} of {visibleQuestions.length}
        </p>
      </div>

      <QuestionBlock
        question={currentQ.question}
        questionNumber={currentVisibleIndex + 1}
        totalQuestions={visibleQuestions.length}
      >
        {renderQuestion()}
      </QuestionBlock>

      <div className={styles.navigation}>
        {currentVisibleIndex > 0 && (
          <button className={styles.navButton} onClick={handlePrevious}>
            Previous
          </button>
        )}
        {currentVisibleIndex < visibleQuestions.length - 1 ? (
          <button 
            className={`${styles.navButton} ${styles.primary}`}
            onClick={handleNext}
            disabled={!canProceed()}
          >
            Next
          </button>
        ) : (
          <button 
            className={`${styles.navButton} ${styles.primary}`}
            onClick={handleSubmit}
            disabled={!canProceed()}
          >
            Submit
          </button>
        )}
      </div>

      {/* Optional Lab Section */}
      <div className={styles.labSection}>
        <button 
          className={styles.labToggle}
          onClick={() => setShowLabs(!showLabs)}
        >
          {showLabs ? '−' : '+'} Optional: Add Hormone Lab Values
        </button>
        
        {showLabs && (
          <div className={styles.labForm}>
            <p className={styles.labDescription}>
              If you have recent hormone lab results, you can add them here for more accurate analysis.
            </p>
            <div className={styles.labGrid}>
              <div className={styles.labInput}>
                <label>Free Testosterone</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="ng/dL"
                  value={answers.q11_labs.free_t}
                  onChange={(e) => handleLabChange('free_t', e.target.value)}
                />
              </div>
              <div className={styles.labInput}>
                <label>DHEA</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="μg/dL"
                  value={answers.q11_labs.dhea}
                  onChange={(e) => handleLabChange('dhea', e.target.value)}
                />
              </div>
              <div className={styles.labInput}>
                <label>LH</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="mIU/mL"
                  value={answers.q11_labs.lh}
                  onChange={(e) => handleLabChange('lh', e.target.value)}
                />
              </div>
              <div className={styles.labInput}>
                <label>FSH</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="mIU/mL"
                  value={answers.q11_labs.fsh}
                  onChange={(e) => handleLabChange('fsh', e.target.value)}
                />
              </div>
              <div className={styles.labInput}>
                <label>TSH</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="μIU/mL"
                  value={answers.q11_labs.tsh}
                  onChange={(e) => handleLabChange('tsh', e.target.value)}
                />
              </div>
              <div className={styles.labInput}>
                <label>T3</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="ng/dL"
                  value={answers.q11_labs.t3}
                  onChange={(e) => handleLabChange('t3', e.target.value)}
                />
              </div>
              <div className={styles.labInput}>
                <label>Insulin</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="μIU/mL"
                  value={answers.q11_labs.insulin}
                  onChange={(e) => handleLabChange('insulin', e.target.value)}
                />
              </div>
              <div className={styles.labInput}>
                <label>HbA1c</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="%"
                  value={answers.q11_labs.hba1c}
                  onChange={(e) => handleLabChange('hba1c', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Survey; 