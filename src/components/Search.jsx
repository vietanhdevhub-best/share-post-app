/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useEffect } from 'react';
import DispatchContext from '../DispatchContext';
import { useImmer } from 'use-immer';
import Axios from 'axios';
import Post from './Post';

function Search() {
  const appDispatch = useContext(DispatchContext);
  const [state, setState] = useImmer({
    searchTerm: '',
    results: [],
    requestCount: 0,
    show: 'neither',
  });
  const handleKeyPress = (e) => {
    if (e.keyCode === 27) {
      appDispatch({ type: 'closeSearch' });
    }
  };
  useEffect(() => {
    window.addEventListener('keyup', handleKeyPress);
    return () => {
      window.removeEventListener('keyup', handleKeyPress);
    };
  }, []);

  useEffect(() => {
    if (state.searchTerm.trim()) {
      setState((draft) => {
        draft.show = 'loading';
      });
      const delay = setTimeout(() => {
        setState((draft) => {
          draft.requestCount++;
        });
      }, 1000);
      return () => {
        clearTimeout(delay);
      };
    } else {
      setState((draft) => {
        draft.show = 'neither';
      });
    }
  }, [state.searchTerm]);

  useEffect(() => {
    if (state.requestCount) {
      const ourRequest = Axios.CancelToken.source();
      async function fetchSearchResults() {
        try {
          const response = await Axios.post(
            '/search',
            { searchTerm: state.searchTerm },
            { cancelToken: ourRequest.token }
          );
          setState((draft) => {
            draft.results = response.data;
            draft.show = 'results';
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
  }, [state.requestCount]);

  const handleChange = (e) => {
    const value = e.target.value;
    setState((draft) => {
      draft.searchTerm = value;
    });
  };
  return (
    <div className="search-overlay">
      <div className="search-overlay-top shadow-sm">
        <div className="container container--narrow">
          <label htmlFor="live-search-field" className="search-overlay-icon">
            <i className="fas fa-search" />
          </label>
          <input
            onChange={handleChange}
            autoFocus
            type="text"
            autoComplete="off"
            id="live-search-field"
            className="live-search-field"
            placeholder="What are you interested in?"
          />
          <span
            onClick={() => appDispatch({ type: 'closeSearch' })}
            className="close-live-search"
          >
            <i className="fas fa-times-circle" />
          </span>
        </div>
      </div>
      <div className="search-overlay-bottom">
        <div className="container container--narrow py-3">
          <div
            className={
              'circle-loader ' +
              (state.show === 'loading' ? 'circle-loader--visible' : '')
            }
          ></div>
          <div
            className={
              'live-search-results ' +
              (state.show === 'results' ? 'live-search-results--visible' : '')
            }
          >
            {Boolean(state.results.length) && (
              <div className="list-group shadow-sm">
                <div className="list-group-item active">
                  <strong>Search Results</strong> ({state.results.length}{' '}
                  {state.results.length > 1 ? 'items' : 'item'} found)
                </div>
                {state.results.map((post) => {
                  return (
                    <Post
                      post={post}
                      key={post.id}
                      onClick={() => {
                        appDispatch({ type: 'closeSearch' });
                      }}
                    />
                  );
                })}
              </div>
            )}
            {!Boolean(state.results.length) && (
              <div className="alert alert-danger text-center shadow-sm">
                Sorry we don't find any result
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Search;
