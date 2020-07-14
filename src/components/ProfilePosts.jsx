/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import LoadingIcon from './Loading-icon';
import Axios from 'axios';
import Post from './Post';

function ProfilePosts() {
  const [posts, setPost] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { username } = useParams();
  useEffect(() => {
    const ourRequest = Axios.CancelToken.source();
    async function fetchPost() {
      try {
        const response = await Axios.get(`/profile/${username}/posts`, {
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
  }, [username]);
  if (isLoading) return <LoadingIcon />;
  return (
    <div className="list-group">
      {posts.map((post) => {
        return <Post post={post} key={post._id} author={true} />;
      })}
    </div>
  );
}

export default ProfilePosts;
