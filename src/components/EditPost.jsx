/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable default-case */
import React, { useEffect, useContext } from 'react';
import { useImmerReducer } from 'use-immer';
import { useParams, Link, withRouter } from 'react-router-dom';
import Page from './Page';
import Axios from 'axios';
import LoadingIcon from './Loading-icon';
import StateContext from '../StateContext';
import DispatchContext from '../DispatchContext';
import NotFound from './NotFound';

function EditPost(props) {
  const initialState = {
    title: {
      value: '',
      hasError: false,
      messages: '',
    },
    body: {
      value: '',
      hasError: false,
      messages: '',
    },
    isFetching: true,
    isSaving: false,
    id: useParams().id,
    sendCount: 0,
    notFound: false,
  };
  const ourReducer = (draft, action) => {
    switch (action.type) {
      case 'fetchComplete':
        draft.title.value = action.value.title;
        draft.isFetching = false;
        draft.body.value = action.value.body;
        return;
      case 'titleUpdate':
        draft.title.hasError = false;
        draft.title.value = action.value;
        return;
      case 'bodyUpdate':
        draft.body.hasError = false;
        draft.body.value = action.value;
        return;
      case 'submit':
        if (!draft.title.hasError && !draft.body.hasError) {
          draft.sendCount++;
        }
        return;
      case 'isSaving':
        draft.isSaving = true;
        return;
      case 'savingFinished':
        draft.isSaving = false;
        return;
      case 'titleRules':
        if (!action.value.trim()) {
          draft.title.hasError = true;
          draft.title.message = 'you must provide title';
        }
        return;
      case 'bodyRules':
        if (!action.value.trim()) {
          draft.body.hasError = true;
          draft.body.message = 'you must provide body';
        }
        return;
      case 'notFound':
        draft.notFound = true;
        return;
    }
  };
  const [state, dispatch] = useImmerReducer(ourReducer, initialState);
  const appState = useContext(StateContext);
  const appDispatch = useContext(DispatchContext);
  useEffect(() => {
    const ourRequest = Axios.CancelToken.source();
    async function fetchPost() {
      try {
        const response = await Axios.get(`/post/${state.id}`, {
          cancelToken: ourRequest.token,
        });
        if (response.data.author.username !== appState.user.username) {
          appDispatch({
            type: 'flashMessage',
            value: 'you do not allow to edit this post',
          });
          props.history.push('/');
        } else if (response.data) {
          dispatch({ type: 'fetchComplete', value: response.data });
        } else {
          dispatch({ type: 'notFound' });
        }
      } catch (error) {
        console.log('the request has been cancelled');
      }
    }
    fetchPost();
    return () => {
      ourRequest.cancel();
    };
  }, []);
  useEffect(() => {
    if (state.sendCount > 0) {
      dispatch({ type: 'isSaving' });
      const ourRequest = Axios.CancelToken.source();
      async function fetchPost() {
        try {
          const response = await Axios.post(
            `/post/${state.id}/edit`,
            {
              title: state.title.value,
              body: state.body.value,
              token: appState.user.token,
            },
            {
              cancelToken: ourRequest.token,
            }
          );
          dispatch({ type: 'fetchComplete', value: response.data });
          appDispatch({ type: 'flashMessage', value: 'update completed' });
          dispatch({ type: 'savingFinished' });
        } catch (error) {
          console.log('the request has been cancelled');
        }
      }
      fetchPost();
      return () => {
        ourRequest.cancel();
      };
    }
  }, [state.sendCount]);
  if (state.notFound) {
    return <NotFound />;
  }
  if (state.isFetching)
    return (
      <Page title="...">
        <LoadingIcon />
      </Page>
    );
  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch({ type: 'titleRules', value: state.title.value });
    dispatch({ type: 'bodyRule', value: state.body.value });
    dispatch({ type: 'submit' });
  };
  return (
    <Page title="">
      <Link to={`/post/${state.id}`} className="small font-weight-bold">
        &laquo; Back to permanent link
      </Link>
      <form className="mt-3" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="post-title" className="text-muted mb-1">
            <small>Title</small>
          </label>
          <input
            onBlur={(e) =>
              dispatch({ type: 'titleRules', value: e.target.value })
            }
            onChange={(e) =>
              dispatch({ type: 'titleUpdate', value: e.target.value })
            }
            autoFocus
            name="title"
            id="post-title"
            className="form-control form-control-lg form-control-title"
            type="text"
            placeholder=""
            autoComplete="off"
            value={state.title.value}
          />
          {state.title.hasError && (
            <div className="alert alert-danger small liveValidateMessage">
              {state.title.message}
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="post-body" className="text-muted mb-1 d-block">
            <small>Body Content</small>
          </label>
          <textarea
            onBlur={(e) =>
              dispatch({ type: 'bodyRules', value: e.target.value })
            }
            onChange={(e) =>
              dispatch({ type: 'bodyUpdate', value: e.target.value })
            }
            name="body"
            id="post-body"
            className="body-content tall-textarea form-control"
            type="text"
            value={state.body.value}
          />
          {state.body.hasError && (
            <div className="alert alert-danger small liveValidateMessage">
              {state.body.message}
            </div>
          )}
        </div>

        <button className="btn btn-primary" disable={state.isSaving}>
          Update New Post
        </button>
      </form>
    </Page>
  );
}

export default withRouter(EditPost);
