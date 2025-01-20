import React, {  useEffect, useState } from 'react';
import ChatBotStart from './Components/ChatBotStart';
import ChatBotApp from './Components/ChatBotApp';
import { v4 as uuidv4 } from 'uuid';

// import { debounce, throttle } from 'lodash';

export const App = () => {
  const [isChatting, setIsChatting] = useState(false);
  const [chats, setChats] = useState([])
  const [activeChatId, setActiveChatId] = useState(null)
 /* !! */ const [messages, setMessages] = useState(chats[activeChatId]?.messages || []);

  useEffect(() => {
    const storedChats = JSON.parse(localStorage.getItem('chats')) || [];
    setChats(storedChats);
    
    if (storedChats.length > 0){
      setActiveChatId(storedChats[0].id)
      setMessages(storedChats[0].messages)
    }
  }, [])

  const handleChatStart = () => {
    setIsChatting(true);

    if (chats.length === 0) {
     createNewChat()
    }
  };

  const handleGoBack = () => {
    setIsChatting(false);
  };



  const createNewChat = () => {
    const newChat = {
      id: uuidv4(),
      displayId: `Chat ${new Date().toLocaleDateString(
        'en-GB'
      )} ${new Date().toLocaleTimeString()}`,
      messages:  [],
    };
    
    const updatedChats = [newChat,...chats]
    setChats(updatedChats)
    localStorage.setItem('chats', JSON.stringify(updatedChats));
    localStorage.setItem(newChat.id, JSON.stringify(newChat.messages));
    setActiveChatId(newChat.id)
    const activeChatObject = updatedChats.find(chat => chat.id === newChat.id);
    setMessages(activeChatObject ? activeChatObject.messages : []);
    
  }



  //const debouncedCreateNewChat = throttle(createNewChat, 200);

  return (
    <div>
      <div className='container'>
        {isChatting ? (
          <ChatBotApp
            onGoBack={handleGoBack}
            chats={chats}
            setChats={setChats}
            activeChatId={activeChatId}
            setActiveChatId={setActiveChatId}
            onNewChat={createNewChat}
            messages={messages}
            setMessages={setMessages}/>
        ) : (
          <ChatBotStart onStart={handleChatStart} />
        )}
     
      </div>
     
    </div>
    
  );
};

export default App;
