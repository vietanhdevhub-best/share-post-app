import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import LoadingIcon from './Loading-icon';
import Axios from 'axios';

function ProfileFollowing() {
  const [posts, setPost] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { username } = useParams();
  useEffect(() => {
    const ourRequest = Axios.CancelToken.source();
    async function fetchPost() {
      try {
        const response = await Axios.get(`/profile/${username}/following`, {
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
      {posts.map((follower, index) => {
        return (
          <Link
            key={index}
            to={`/profile/${follower.username}`}
            className="list-group-item list-group-item-action"
          >
            <img className="avatar-tiny" src={follower.avatar} alt="" />{' '}
            {follower.username}
          </Link>
        );
      })}
    </div>
  );
}

export default ProfileFollowing;
