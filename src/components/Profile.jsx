/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useContext } from 'react';
import { useImmer } from 'use-immer';
import StateContext from '../StateContext';
import { useParams, NavLink, Switch, Route } from 'react-router-dom';
import Axios from 'axios';
import Page from './Page';
import ProfilePosts from './ProfilePosts';
import ProfileFollower from './ProfileFollower';
import ProfileFollowing from './ProfileFollowing';

function Profile() {
  const [state, setState] = useImmer({
    isLoadingFollowing: false,
    startFollowingCount: 0,
    stopFollowingCount: 0,
    profileData: {
      profileUsername: '...',
      profileAvatar: 'https://gravatar.com/avatar/placeholder?s=128',
      isFollowing: false,
      counts: {
        followingCount: '',
        followerCount: '',
        postCount: '',
      },
    },
  });
  const { username } = useParams();
  const appContext = useContext(StateContext);
  useEffect(() => {
    const ourRequest = Axios.CancelToken.source();
    async function fetchProfile() {
      try {
        const response = await Axios.post(
          `/profile/${username}`,
          {
            token: appContext.user.token,
          },
          { cancelToken: ourRequest.token }
        );
        setState((draft) => {
          draft.profileData = response.data;
        });
      } catch (error) {
        console.log('the request has been cancelled');
      }
    }
    fetchProfile();
    return () => {
      ourRequest.cancel();
    };
  }, [username]);

  useEffect(() => {
    if (state.startFollowingCount > 0) {
      setState((draft) => {
        draft.isLoadingFollowing = true;
      });
      const ourRequest = Axios.CancelToken.source();
      async function fetchProfile() {
        try {
          await Axios.post(
            `/addFollow/${state.profileData.profileUsername}`,
            {
              token: appContext.user.token,
            },
            { cancelToken: ourRequest.token }
          );
          setState((draft) => {
            draft.profileData.isFollowing = true;
            draft.profileData.counts.followerCount++;
            draft.isLoadingFollowing = false;
          });
        } catch (error) {
          console.log('the request has been cancelled');
        }
      }
      fetchProfile();
      return () => {
        ourRequest.cancel();
      };
    }
  }, [state.startFollowingCount]);

  useEffect(() => {
    if (state.stopFollowingCount > 0) {
      setState((draft) => {
        draft.isLoadingFollowing = true;
      });
      const ourRequest = Axios.CancelToken.source();
      async function fetchProfile() {
        try {
          await Axios.post(
            `/removeFollow/${state.profileData.profileUsername}`,
            {
              token: appContext.user.token,
            },
            { cancelToken: ourRequest.token }
          );
          setState((draft) => {
            draft.profileData.isFollowing = false;
            draft.profileData.counts.followerCount--;
            draft.isLoadingFollowing = false;
          });
        } catch (error) {
          console.log('the request has been cancelled');
        }
      }
      fetchProfile();
      return () => {
        ourRequest.cancel();
      };
    }
  }, [state.stopFollowingCount]);

  const startFollowing = () => {
    setState((draft) => {
      draft.startFollowingCount++;
    });
  };
  const stopFollowing = () => {
    setState((draft) => {
      draft.stopFollowingCount++;
    });
  };
  return (
    <Page title="Profile || ">
      <h2>
        <img
          className="avatar-small"
          src={state.profileData.profileAvatar}
          alt=""
        />{' '}
        {state.profileData.profileUsername}
        {appContext.loggedIn &&
          !state.profileData.isFollowing &&
          state.profileData.profileUsername !== appContext.user.username &&
          state.profileData.profileUsername !== '...' && (
            <button
              onClick={startFollowing}
              disabled={state.isLoadingFollowing}
              className="btn btn-primary btn-sm ml-2"
            >
              Follow <i className="fas fa-user-plus"></i>
            </button>
          )}
        {appContext.loggedIn &&
          state.profileData.isFollowing &&
          state.profileData.profileUsername !== appContext.user.username &&
          state.profileData.profileUsername !== '...' && (
            <button
              onClick={stopFollowing}
              disabled={state.isLoadingFollowing}
              className="btn btn-danger btn-sm ml-2"
            >
              UnFollow <i className="fas fa-user-times"></i>
            </button>
          )}
      </h2>

      <div className="profile-nav nav nav-tabs pt-2 mb-4">
        <NavLink
          exact
          to={`/profile/${state.profileData.profileUsername}`}
          className="nav-item nav-link"
        >
          Posts: {state.profileData.counts.postCount}
        </NavLink>
        <NavLink
          to={`/profile/${state.profileData.profileUsername}/followers`}
          className="nav-item nav-link"
        >
          Followers: {state.profileData.counts.followerCount}
        </NavLink>
        <NavLink
          to={`/profile/${state.profileData.profileUsername}/following`}
          className="nav-item nav-link"
        >
          Following: {state.profileData.counts.followingCount}
        </NavLink>
      </div>
      <Switch>
        <Route exact path="/profile/:username" component={ProfilePosts} />
        <Route
          path="/profile/:username/followers"
          component={ProfileFollower}
        />
        <Route
          path="/profile/:username/following"
          component={ProfileFollowing}
        />
      </Switch>
    </Page>
  );
}

export default Profile;
