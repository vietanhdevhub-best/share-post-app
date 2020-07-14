/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable default-case */
import React, { useEffect, useContext } from 'react';
import { useImmerReducer } from 'use-immer';
import Page from './Page';
import { CSSTransition } from 'react-transition-group';
import DispatchContext from '../DispatchContext';
import Axios from 'axios';

function HomeGuest() {
  const initialState = {
    username: {
      value: '',
      hasError: false,
      message: '',
      isUnique: true,
      checkCount: 0,
    },
    email: {
      value: '',
      hasError: false,
      message: '',
      isUnique: true,
      checkCount: 0,
    },
    password: {
      value: '',
      hasError: false,
      message: '',
      isUnique: true,
      checkCount: 0,
    },
    submitCount: 0,
  };
  const ourReducer = (draft, action) => {
    switch (action.type) {
      case 'usernameImmediately':
        draft.username.hasError = false;
        draft.username.value = action.value;
        if (draft.username.value.length > 30) {
          draft.username.hasError = true;
          draft.username.message = 'username is too long';
        }
        if (
          draft.username.value.length > 0 &&
          !/^([a-zA-Z0-9]+)$/.test(draft.username.value)
        ) {
          draft.username.hasError = true;
          draft.username.message = 'username contain invalid character';
        }
        return;
      case 'usernameAfterDelay':
        if (draft.username.value.length < 3) {
          draft.username.hasError = true;
          draft.username.message = 'username must be at least 3 character';
        }
        if (!draft.username.hasError && !action.noRequest) {
          draft.username.checkCount++;
        }
        return;
      case 'usernameUniqueResult':
        if (action.value) {
          draft.username.hasError = true;
          draft.username.message = 'username must be unique';
          draft.username.isUnique = false;
        } else {
          draft.username.hasError = false;
          draft.username.isUnique = true;
        }
        return;
      case 'emailImmediately':
        draft.email.hasError = false;
        draft.email.value = action.value;
        return;
      case 'emailAfterDelay':
        if (!/^\S+@\S+$/.test(draft.email.value)) {
          draft.email.hasError = true;
          draft.email.message = 'you must provide invalid email';
        }
        if (!draft.email.hasError && !action.noRequest) {
          draft.email.checkCount++;
        }
        return;
      case 'emailUniqueResult':
        if (action.value) {
          draft.email.hasError = true;
          draft.email.message = 'this email has already been taken';
          draft.email.isUnique = false;
        } else {
          draft.email.hasError = false;
          draft.email.isUnique = true;
        }
        return;
      case 'passwordImmediately':
        draft.password.hasError = false;
        draft.password.value = action.value;
        if (draft.password.value.length > 30) {
          draft.password.hasError = true;
          draft.password.message = 'your password is too long';
        }
        return;
      case 'passwordAfterDelay':
        if (draft.password.value.length < 12) {
          draft.password.hasError = true;
          draft.password.message =
            'your password must be longer than 12 characters';
        }
        return;
      case 'submitForm':
        if (
          !draft.username.hasError &&
          !draft.password.hasError &&
          !draft.email.hasError &&
          draft.username.isUnique &&
          draft.email.isUnique
        ) {
          draft.submitCount++;
        }
        return;
    }
  };
  const [state, dispatch] = useImmerReducer(ourReducer, initialState);
  const appDispatch = useContext(DispatchContext);
  useEffect(() => {
    if (state.username.value) {
      const delay = setTimeout(() => {
        dispatch({ type: 'usernameAfterDelay' });
      }, 800);
      return () => {
        clearTimeout(delay);
      };
    }
  }, [state.username.value]);

  useEffect(() => {
    if (state.email.value) {
      const delay = setTimeout(() => {
        dispatch({ type: 'emailAfterDelay' });
      }, 800);
      return () => {
        clearTimeout(delay);
      };
    }
  }, [state.email.value]);

  useEffect(() => {
    if (state.password.value) {
      const delay = setTimeout(() => {
        dispatch({ type: 'passwordAfterDelay' });
      }, 800);
      return () => {
        clearTimeout(delay);
      };
    }
  }, [state.password.value]);
  useEffect(() => {
    if (state.username.checkCount) {
      const ourRequest = Axios.CancelToken.source();
      async function fetchSearchResults() {
        try {
          const response = await Axios.post(
            '/doesUsernameExist',
            { username: state.username.value },
            { cancelToken: ourRequest.token }
          );
          dispatch({ type: 'usernameUniqueResult', value: response.data });
        } catch (error) {
          console.log('there was a problem or request has been cancelled');
        }
      }
      fetchSearchResults();
      return () => {
        ourRequest.cancel();
      };
    }
  }, [state.username.checkCount]);

  useEffect(() => {
    if (state.email.checkCount) {
      const ourRequest = Axios.CancelToken.source();
      async function fetchSearchResults() {
        try {
          const response = await Axios.post(
            '/doesEmailExist',
            { email: state.email.value },
            { cancelToken: ourRequest.token }
          );
          dispatch({ type: 'emailUniqueResult', value: response.data });
        } catch (error) {
          console.log('there was a problem or request has been cancelled');
        }
      }
      fetchSearchResults();
      return () => {
        ourRequest.cancel();
      };
    }
  }, [state.email.checkCount]);

  useEffect(() => {
    if (state.submitCount) {
      const ourRequest = Axios.CancelToken.source();
      async function fetchSearchResults() {
        try {
          const response = await Axios.post(
            '/register',
            {
              username: state.username.value,
              email: state.email.value,
              password: state.password.value,
            },
            { cancelToken: ourRequest.token }
          );
          appDispatch({ type: 'login', data: response.data });
          appDispatch({
            type: 'flashMessage',
            value: 'you have created a new account!',
          });
        } catch (error) {
          console.log('there was a problem or request has been cancelled');
        }
      }
      fetchSearchResults();
      return () => {
        ourRequest.cancel();
      };
    }
  }, [state.submitCount]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch({ type: 'usernameImmediately', value: state.username.value });
    dispatch({ type: 'usernameAfterDelay', noRequest: true });
    dispatch({ type: 'emailImmediately', value: state.email.value });
    dispatch({ type: 'emailAfterDelay', noRequest: true });
    dispatch({ type: 'passwordImmediately', value: state.password.value });
    dispatch({ type: 'passwordAfterDelay' });
    dispatch({ type: 'submitForm' });
  };
  return (
    <Page wide={true} title="">
      <div className="row align-items-center">
        <div className="col-lg-7 py-3 py-md-5">
          <h1 className="display-3">Remember Writing?</h1>
          <p className="lead text-muted">
            Are you sick of short tweets and impersonal &ldquo;shared&rdquo;
            posts that are reminiscent of the late 90&rsquo;s email forwards? We
            believe getting back to actually writing is the key to enjoying the
            internet again.
          </p>
        </div>
        <div className="col-lg-5 pl-lg-5 pb-3 py-lg-5">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username-register" className="text-muted mb-1">
                <small>Username</small>
              </label>
              <CSSTransition
                in={state.username.hasError}
                timeout={330}
                classNames="liveValidateMessage"
                unmountOnExit
              >
                {
                  <div className="alert alert-danger small liveValidateMessage">
                    {state.username.message}
                  </div>
                }
              </CSSTransition>
              <input
                onChange={(e) =>
                  dispatch({
                    type: 'usernameImmediately',
                    value: e.target.value,
                  })
                }
                id="username-register"
                name="username"
                className="form-control"
                type="text"
                placeholder="Pick a username"
                autoComplete="off"
              />
            </div>
            <div className="form-group">
              <label htmlFor="email-register" className="text-muted mb-1">
                <small>Email</small>
              </label>
              <CSSTransition
                in={state.email.hasError}
                timeout={330}
                classNames="liveValidateMessage"
                unmountOnExit
              >
                {
                  <div className="alert alert-danger small liveValidateMessage">
                    {state.email.message}
                  </div>
                }
              </CSSTransition>
              <input
                onChange={(e) =>
                  dispatch({ type: 'emailImmediately', value: e.target.value })
                }
                id="email-register"
                name="email"
                className="form-control"
                type="text"
                placeholder="you@example.com"
                autoComplete="off"
              />
            </div>
            <div className="form-group">
              <label htmlFor="password-register" className="text-muted mb-1">
                <small>Password</small>
              </label>
              <CSSTransition
                in={state.password.hasError}
                timeout={330}
                classNames="liveValidateMessage"
                unmountOnExit
              >
                {
                  <div className="alert alert-danger small liveValidateMessage">
                    {state.password.message}
                  </div>
                }
              </CSSTransition>
              <input
                onChange={(e) =>
                  dispatch({
                    type: 'passwordImmediately',
                    value: e.target.value,
                  })
                }
                id="password-register"
                name="password"
                className="form-control"
                type="password"
                placeholder="Create a password"
              />
            </div>
            <button
              type="submit"
              className="py-3 mt-4 btn btn-lg btn-success btn-block"
            >
              Sign up for ComplexApp
            </button>
          </form>
        </div>
      </div>
    </Page>
  );
}

export default HomeGuest;
