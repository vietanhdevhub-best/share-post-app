/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable default-case */
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import './App.css';
import Axios from 'axios';
import { useImmerReducer } from 'use-immer';
import { CSSTransition } from 'react-transition-group';

// my context
import DispatchContext from './DispatchContext';
import StateContext from './StateContext';

// my components
import Header from './components/Header';
import HomeGuest from './components/HomeGuest';
import Footer from './components/Footer';
import About from './components/About';
import Terms from './components/Terms';
import Home from './components/Home';
import CreatePost from './components/CreatePost';
import ViewPost from './components/ViewPost';
import FlashMessage from './components/FlashMessage';
import Profile from './components/Profile';
import EditPost from './components/EditPost';
import NotFound from './components/NotFound';
import Search from './components/Search';
import Chat from './components/Chat';

Axios.defaults.baseURL = 'http://localhost:8080';

function App() {
  const initialState = {
    loggedIn: Boolean(localStorage.getItem('complexAppToken')),
    flashMessage: [],
    user: {
      username: localStorage.getItem('complexAppUsername'),
      avatar: localStorage.getItem('complexAppAvatar'),
      token: localStorage.getItem('complexAppToken'),
    },
    searchIsOpen: false,
    chatIsOpen: false,
    unReadMessagesCount: 0,
  };
  const ourReducer = (state, action) => {
    switch (action.type) {
      case 'login':
        state.loggedIn = true;
        state.user = action.data;
        return;
      case 'logout':
        state.loggedIn = false;
        return;
      case 'flashMessage':
        state.flashMessage.push(action.value);
        return;
      case 'openSearch':
        state.searchIsOpen = true;
        return;
      case 'closeSearch':
        state.searchIsOpen = false;
        return;
      case 'toggleChat':
        state.isChatOpen = !state.isChatOpen;
        return;
      case 'closeChat':
        state.isChatOpen = false;
        return;
      case 'increaseUnreadMessage':
        state.unReadMessagesCount++;
        return;
      case 'resetUnreadMessage':
        state.unReadMessagesCount = 0;
    }
  };
  const [state, dispatch] = useImmerReducer(ourReducer, initialState);
  useEffect(() => {
    if (state.loggedIn) {
      localStorage.setItem('complexAppToken', state.user.token);
      localStorage.setItem('complexAppUsername', state.user.username);
      localStorage.setItem('complexAppAvatar', state.user.avatar);
    } else {
      localStorage.removeItem('complexAppToken');
      localStorage.removeItem('complexAppAvatar');
      localStorage.removeItem('complexAppUsername');
    }
  }, [state.loggedIn]);

  useEffect(() => {
    if (state.loggedIn) {
      const ourRequest = Axios.CancelToken.source();
      async function fetchSearchResults() {
        try {
          const response = await Axios.post(
            '/checkToken',
            { token: state.user.token },
            { cancelToken: ourRequest.token }
          );
          if (!response.data) {
            dispatch({ type: 'logout' });
            dispatch({ type: 'flashMessage', value: 'your session expired' });
          }
        } catch (error) {
          console.log('there was a problem or request has been cancelled');
        }
      }
      fetchSearchResults();
      return () => {
        ourRequest.cancel();
      };
    }
  }, []);
  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        <Router>
          <FlashMessage messages={state.flashMessage} />
          <Header />

          <Switch>
            <Route
              path="/"
              exact
              component={state.loggedIn ? Home : HomeGuest}
            />
            <Route path="/profile/:username" component={Profile} />
            <Route path="/create-post" component={CreatePost} />
            <Route path="/post/:id" exact component={ViewPost} />
            <Route path="/post/:id/edit" exact component={EditPost} />
            <Route path="/about-us" component={About} />
            <Route path="/terms" component={Terms} />
            <Route component={NotFound} />
          </Switch>

          <CSSTransition
            timeout={330}
            in={state.searchIsOpen}
            classNames="search-overlay"
            unmountOnExit
          >
            <Search />
          </CSSTransition>
          <Chat />
          <Footer />
        </Router>
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
}

export default App;
