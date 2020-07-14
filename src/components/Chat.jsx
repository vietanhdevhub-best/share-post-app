/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useRef, useEffect } from 'react';
import StateContext from '../StateContext';
import DispatchContext from '../DispatchContext';
import { useImmer } from 'use-immer';
import { Link } from 'react-router-dom';
import io from 'socket.io-client';

const socket = io('http://localhost:8080');

function Chat() {
  const chatField = useRef(null);
  const chatLog = useRef(null);
  const appContext = useContext(StateContext);
  const appDispatch = useContext(DispatchContext);

  useEffect(() => {
    socket.on('chatFromServer', (message) => {
      setState((draft) => {
        draft.chatMessages.push(message);
      });
    });
  }, []);
  const handleChat = (e) => {
    const value = e.target.value;
    setState((draft) => {
      draft.chatField = value;
    });
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    //send message to server
    socket.emit('chatFromBrowser', {
      message: state.chatField,
      token: appContext.user.token,
    });
    setState((draft) => {
      draft.chatMessages.push({
        message: state.chatField,
        username: appContext.user.username,
        avatar: appContext.user.avatar,
      });
      draft.chatField = '';
    });
  };
  const [state, setState] = useImmer({
    chatField: '',
    chatMessages: [],
  });
  useEffect(() => {
    if (appContext.isChatOpen) {
      chatField.current.focus();
      appDispatch({ type: 'resetUnreadMessage' });
    }
  }, [appContext.isChatOpen]);

  // scroll to bottom
  useEffect(() => {
    chatLog.current.scrollTop = chatLog.current.scrollHeight;
    if (!appContext.isChatOpen && state.chatMessages.length > 0) {
      appDispatch({ type: 'increaseUnreadMessage' });
    }
  }, [state.chatMessages]);

  return (
    <div
      id="chat-wrapper"
      className={
        'chat-wrapper shadow border-top border-left border-right ' +
        (appContext.isChatOpen ? 'chat-wrapper--is-visible' : '')
      }
    >
      <div className="chat-title-bar bg-primary">
        Chat
        <span
          onClick={() => appDispatch({ type: 'closeChat' })}
          className="chat-title-bar-close"
        >
          <i className="fas fa-times-circle" />
        </span>
      </div>
      <div ref={chatLog} id="chat" className="chat-log">
        {state.chatMessages.map((message, index) => {
          if (message.username === appContext.user.username) {
            return (
              <div key={index} className="chat-self">
                <div className="chat-message">
                  <div className="chat-message-inner">{message.message}</div>
                </div>
                <img
                  className="chat-avatar avatar-tiny"
                  src={message.avatar}
                  alt=""
                />
              </div>
            );
          }
          return (
            <div key={index} className="chat-other">
              <Link to={`/profile/${message.username}`}>
                <img className="avatar-tiny" src={message.avatar} alt="" />
              </Link>
              <div className="chat-message">
                <div className="chat-message-inner">
                  <Link to={`/profile/${message.username}`}>
                    <strong>{message.username}:</strong>
                  </Link>
                  {message.message}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <form
        onSubmit={handleSubmit}
        id="chatForm"
        className="chat-form border-top"
      >
        <input
          onChange={handleChat}
          ref={chatField}
          type="text"
          className="chat-field"
          id="chatField"
          placeholder="Type a message…"
          autoComplete="off"
          value={state.chatField}
        />
      </form>
    </div>
  );
}

export default Chat;
