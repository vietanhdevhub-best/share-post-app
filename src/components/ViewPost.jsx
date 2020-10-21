/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, withRouter } from 'react-router-dom';
import Page from './Page';
import Axios from 'axios';
import ReactMarkdown from 'react-markdown';
import LoadingIcon from './Loading-icon';
import ReactTooltip from 'react-tooltip';
import NotFound from './NotFound';
import StateContext from '../StateContext';
import DispatchContext from '../DispatchContext';

function ViewPost(props) {
  const appContext = useContext(StateContext);
  const appDispatch = useContext(DispatchContext);
  const [isLoading, setIsLoading] = useState(true);
  const [post, setPost] = useState();
  const { id } = useParams();
  const handleDelete = async () => {
    const areYouSure = window.confirm('Do you really want to delete this post');
    if (areYouSure === true) {
      const response = await Axios.delete(`/post/${id}`, {
        data: { token: appContext.user.token },
      });
      if (response.data === 'Success') {
        appDispatch({ type: 'flashMessage', value: 'delete successfully' });
        props.history.push(`/profile/${appContext.user.username}`);
      }
    }
  };
  useEffect(() => {
    const ourRequest = Axios.CancelToken.source();
    async function fetchPost() {
      try {
        const response = await Axios.get(`/post/${id}`, {
          cancelToken: ourRequest.token,
        });
        setPost(response.data);
        setIsLoading(false);
      } catch (error) {
        console.log('the request has been cancelled');
      }
    }
    fetchPost();
    return () => {
      ourRequest.cancel();
    };
  }, [id]);
  if (!isLoading && !post) {
    return <NotFound />;
  }
  if (isLoading)
    return (
      <Page title="...">
        <LoadingIcon />
      </Page>
    );
  const date = new Date(post.createdDate);
  const formatDate = `${
    date.getMonth() + 1
  }/${date.getDate()}/${date.getFullYear()}`;

  function isOwner() {
    if (appContext.loggedIn) {
      return appContext.user.username === post.author.username;
    }
    return false;
  }

  return (
    <Page title={`${post.title} || `}>
      <div className="d-flex justify-content-between">
        <h2>{post.title}</h2>
        {isOwner() && (
          <span className="pt-2">
            <Link
              to={`/post/${post._id}/edit`}
              className="text-primary mr-2"
              data-tip="Edit"
              data-for="edit"
            >
              <i className="fas fa-edit"></i>
            </Link>
            <ReactTooltip id="edit" className="custom-tooltip" />{' '}
            <a
              onClick={handleDelete}
              className="delete-post-button text-danger"
              data-tip="Delete"
              data-for="delete"
            >
              <i className="fas fa-trash"></i>
            </a>
            <ReactTooltip id="delete" className="custom-tooltip" />
          </span>
        )}
      </div>

      <p className="text-muted small mb-4">
        <Link to={`/profile/${post.author.username}`}>
          <img className="avatar-tiny" src={post.author.avatar} alt="" />
        </Link>
        Posted by{' '}
        <Link to={`/profile/${post.author.username}`}>
          {post.author.username}
        </Link>{' '}
        on {formatDate}
      </p>

      <div className="body-content">
        <ReactMarkdown source={post.body} />
      </div>
    </Page>
  );
}

export default withRouter(ViewPost);
