import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Home.module.css';

const Home: React.FC = () => {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/survey');
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Hormone Health Assessment</h1>
        <p className={styles.description}>
          Take a quick 8-10 question survey to identify potential hormone imbalances 
          and get personalized recommendations for better hormonal health.
        </p>
        <div className={styles.features}>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>📋</span>
            <span>Quick symptom assessment</span>
          </div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>🔬</span>
            <span>Optional lab value analysis</span>
          </div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>💡</span>
            <span>Personalized recommendations</span>
          </div>
        </div>
        <button className={styles.startButton} onClick={handleStart}>
          Start Assessment
        </button>
      </div>
    </div>
  );
};

export default Home; 