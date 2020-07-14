/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import ReactTooltip from 'react-tooltip';
import DispatchContext from '../DispatchContext';
import StateContext from '../StateContext';

function HeaderLoggedIn() {
  const appDispatch = useContext(DispatchContext);
  const appContext = useContext(StateContext);
  const handleClick = () => {
    appDispatch({ type: 'logout' });
    appDispatch({
      type: 'flashMessage',
      value: 'you have successfully logged out',
    });
  };
  const handleSearch = (e) => {
    e.preventDefault();
    appDispatch({ type: 'openSearch' });
  };
  return (
    <div className="flex-row my-3 my-md-0">
      <a
        onClick={handleSearch}
        href="#"
        className="text-white mr-2 header-search-icon"
        data-tip="Search"
        data-for="search"
      >
        <i className="fas fa-search"></i>
      </a>
      <ReactTooltip id="search" className="custom-tooltip" />
      <span
        onClick={() => appDispatch({ type: 'toggleChat' })}
        data-tip="Chat"
        data-for="chat"
        className={
          'mr-2 header-chat-icon ' +
          (appContext.unReadMessagesCount > 0 ? 'text-danger' : 'text-white')
        }
      >
        <i className="fas fa-comment"></i>
        {appContext.unReadMessagesCount > 0 ? (
          <span className="chat-count-badge text-white">
            {appContext.unReadMessagesCount < 9
              ? appContext.unReadMessagesCount
              : '+9'}
          </span>
        ) : (
          ''
        )}
      </span>
      <ReactTooltip id="chat" className="custom-tooltip" />
      <Link
        data-tip="Profile"
        data-for="profile"
        to={`/profile/${appContext.user.username}`}
        className="mr-2"
      >
        <img
          className="small-header-avatar"
          src={appContext.user.avatar}
          alt=""
        />
      </Link>
      <ReactTooltip id="profile" className="custom-tooltip" />
      <Link className="btn btn-sm btn-success mr-2" to="/create-post">
        Create Post
      </Link>
      <button className="btn btn-sm btn-secondary" onClick={handleClick}>
        Sign Out
      </button>
    </div>
  );
}

export default HeaderLoggedIn;
