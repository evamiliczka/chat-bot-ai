import React from 'react';
import ProgramDescription from './ProgramDescription';
import './ChatBotStart.css';

const ChatBotStart = ({ onStart }) => {
  return (
    <div className='start-page'>
      <button onClick={onStart} className='start-page-btn'>
        Eva's Own Chat AI
      </button>
      <ProgramDescription />
    </div>
  );
};

export default ChatBotStart;
