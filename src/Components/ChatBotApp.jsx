import React, { useEffect,  useRef,  useState } from 'react';
import './ChatBotApp.css';
import Picker from '@emoji-mart/react'
import data from '@emoji-mart/data'
// const dotenv = require('dotenv').config();


const ChatBotApp = ({ onGoBack, 
  chats, 
  setChats, 
  activeChatId, 
  setActiveChatId, onNewChat,
messages, setMessages }) => {
 
  const [inputValue, setInputValue] = useState('');
  /* Stores list of messages in the current chat session: */
 // const [messages, setMessages] = useState(chats[activeChatId]?.messages || []);
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker,setShowEmojiPicker] = useState(false);
  const [showChatList, setShowChatList] = useState(false)
  const chatEndRef = useRef(null);

  // pri zmene chatu alebo chats sa menia messages
  // ?? alo by sa to dat BEZ useEffect, priamo setMessages ked sa nieco zmeni...???
  // useEffect(() => {
  //   console.log('Use effect');
  //  const activeChatObject = chats.find(chat => chat.id === activeChatId);
  //   setMessages(activeChatObject ? activeChatObject.messages : []);
  // }, [activeChatId, chats]);

  useEffect(() => {
    if (activeChatId){
      const storedMessages = JSON.parse(localStorage.getItem(activeChatId)) || [];
      setMessages(storedMessages);
    }
  },[activeChatId])

  const handleEmojiSelect = (emoji) => {
    setInputValue((prevInput) => prevInput + emoji.native);
  }

  useEffect(()=>{
    chatEndRef.current?.scrollIntoView({behavior: 'smooth'});
  },[messages])


  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const sendMessage = async () => {

    if (inputValue === '') return;
  
    if (!activeChatId) {
      onNewChat()  
    }
  
    {
      const newMessage = {
        type: 'prompt',
        text: inputValue,
        timeStamp: new Date().toLocaleTimeString(),
      };
      const updatedMessages = [...messages, newMessage];
      setMessages(updatedMessages)
      localStorage.setItem(activeChatId, JSON.stringify(updatedMessages))

      setInputValue('')
      
      const updatedChats = chats.map((chat) => {
        if (chat.id === activeChatId) {
          /* We return the existing chat object with messages updated to updatedMessages */
          /* ???  PRECO tu nemozem pouzit messages??? Ved uz preehlo setMessages...? Kedy to REALNE prebehne ??? */
          return { ...chat, messages: updatedMessages };
        }
        /* Otherwise do not change anything */
        return chat;
      });
      setChats(updatedChats);
      localStorage.setItem('chats',JSON.stringify(updatedChats));
   // }  //else

    
      setIsTyping(true);
      /* response */
      const response = await fetch("https://api.openai.com/v1/chat/completions",
        //options object
        {
          method : 'POST',
          headers : {
            "Content-Type" : "application/json",
            Authorization: `bearer ${import.meta.env.VITE_API_KEY}`
          },
          body : JSON.stringify({
            model : "gpt-3.5-turbo",
            messages : [{
              role: 'user',
              content: newMessage.text
            }],
            max_tokens: 500
          })
        }
      ); //await fetch(...)

      const data = await response.json();
      const chatResponse = data.choices[0].message.content.trim();

      const newResponse = {
        type: 'response',
        text: chatResponse,
        timeStamp: new Date().toLocaleTimeString(),
      }
     
      const updatedMessagesWithResponse = [...updatedMessages, newResponse];
      setMessages(updatedMessagesWithResponse);
      localStorage.setItem(activeChatId,JSON.stringify(updatedMessagesWithResponse));
     
     
      setIsTyping(false);
            
      const updatedChatsWithResponse  = chats.map((chat) => {
        if (chat.id === activeChatId) {
          /* We return the existing chat object with messages updated to updatedMessages */
          
          return { ...chat, messages: updatedMessagesWithResponse };
        }
        /* Otherwise do not change anything */
        return chat;
      });
      setChats(updatedChatsWithResponse);
      localStorage.setItem("chats",JSON.stringify(updatedChatsWithResponse));
      
    }
    
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSelectChat = (id) => {
   
    setActiveChatId(id);
    const activeChatObject = chats.find(chat => chat.id === id);
    setMessages(activeChatObject ? activeChatObject.messages : []);

  }

  const handleDeleteChat = (id) => {
    
    const updatedChats = chats.filter (chat => chat.id !== id);
    setChats(updatedChats);
    localStorage.setItem("chats",JSON.stringify(updatedChats));
    localStorage.removeItem(id) 

    if (id === activeChatId){
      const newActiveChatId = updatedChats.length > 0 ?
        updatedChats[0].id : null;  
      setActiveChatId(newActiveChatId);
    }
  }
  return (
    <div className='chat-app hello'>
     
      <div className={`chat-list ${showChatList?'show':''}`}>
        <div className='chat-list-header'>
        <i className="bx bx-x-circle close-list"
            onClick={()=>setShowChatList(false)}></i>
          <h2>Chat List</h2>
          <i onClick={() => onNewChat()} className='bx bx-edit-alt new-chat'></i>
     
        </div>

        {chats.map((chat) => (
          /* !!! */
          <div
            key={chat.id}
            className={`chat-list-item ${chat.id === activeChatId ? 'active' : ''}`}
            onClick={() => handleSelectChat(chat.id)}
          >
            <h4>{chat.displayId}</h4>
            <i 
              className='bx bx-x-circle'
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteChat(chat.id)}}
                ></i>
          </div>
        ))}
      </div>
      <div className='chat-window'>
        <div className='chat-title'>
          <h3>Chat with AI</h3>
          <i className="bx bx-menu" onClick={()=>setShowChatList(true)}></i>
          <i onClick={onGoBack} className='bx bx-arrow-back arrow'></i>
        </div>
        <div className='chat'>
          {messages.map((msg, index) => (
            <div
              key={index}
              className={msg.type === 'prompt' ? 'prompt' : 'response'}
            >
              {msg.text}
              <span>{msg.timeStamp}</span>
            </div>
          ))}

          {isTyping && <div className='typing'>Typing...</div>}
        <div ref={chatEndRef}></div>
        </div>
        <form className='msg-form' onSubmit={(e) => e.preventDefault()}>

          <span onClick={() => setShowEmojiPicker((prevValue) => !prevValue)           
            }>
            <i className='fa-solid fa-face-smile emoji'
            ></i>
          </span>
          {showEmojiPicker && (
            <div className='picker'>
              <Picker 
                data={data}
                onEmojiSelect = {handleEmojiSelect} 
              />
            </div>)}
          <input
            id='userInput'
            type='text'
            className='msg-input'
            placeholder='Type a message...'
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus ={() => setShowEmojiPicker(false)}
          />
          <span onClick={sendMessage}>
           <i className='fa-solid fa-paper-plane' ></i>
          </span>
        </form>
      </div>
    </div>
  );
};

export default ChatBotApp;
