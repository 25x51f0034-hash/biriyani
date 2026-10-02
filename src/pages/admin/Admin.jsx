import { useState } from 'react';
import Questions from './Questions';
import Quizzes from './Quizzes';
import Attempts from './Attempts';

const TABS = [
  ['questions', 'Question bank'],
  ['quizzes', 'Quizzes'],
  ['attempts', 'All attempts'],
];

export default function Admin() {
  const [tab, setTab] = useState('questions');
  return (
    <>
      <h1>Admin</h1>
      <div className="tabs" role="tablist">
        {TABS.map(([key, label]) => (
          <button key={key} role="tab" aria-selected={tab === key} className={tab === key ? 'on' : ''} onClick={() => setTab(key)}>
            {label}
          </button>
        ))}
      </div>
      {tab === 'questions' && <Questions />}
      {tab === 'quizzes' && <Quizzes />}
      {tab === 'attempts' && <Attempts />}
    </>
  );
}
