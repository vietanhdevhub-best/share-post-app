/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useEffect } from 'react';
import Page from './Page';
import StateContext from '../StateContext';
import { useImmer } from 'use-immer';
import Axios from 'axios';
import LoadingIcon from './Loading-icon';
import Post from './Post';

function Home() {
  const appContext = useContext(StateContext);
  const [state, setState] = useImmer({
    isLoading: true,
    feeds: [],
  });
  useEffect(() => {
    const ourRequest = Axios.CancelToken.source();
    async function fetchProfile() {
      try {
        const response = await Axios.post(
          `/getHomeFeed`,
          {
            token: appContext.user.token,
          },
          { cancelToken: ourRequest.token }
        );
        setState((draft) => {
          draft.feeds = response.data;
          draft.isLoading = false;
        });
      } catch (error) {
        console.log('the request has been cancelled');
      }
    }
    fetchProfile();
    return () => {
      ourRequest.cancel();
    };
  }, []);
  if (state.isLoading === true) {
    return <LoadingIcon />;
  }
  return (
    <Page wide={true} title="">
      {state.feeds.length > 0 && (
        <div>
          <h2 className="text-center mb-4">The latest from Those you follow</h2>
          <div className="list-group">
            {state.feeds.map((post) => {
              return <Post post={post} key={post._id} />;
            })}
          </div>
        </div>
      )}
      {state.feeds.length === 0 && (
        <div>
          {' '}
          <h2 className="text-center">
            Hello <strong>{appContext.user.username}</strong>, your feed is
            empty.
          </h2>
          <p className="lead text-muted text-center">
            Your feed displays the latest posts from the people you follow. If
            you don&rsquo;t have any friends to follow that&rsquo;s okay; you
            can use the &ldquo;Search&rdquo; feature in the top menu bar to find
            content written by people with similar interests and then follow
            them.
          </p>
        </div>
      )}
    </Page>
  );
}

export default Home;
