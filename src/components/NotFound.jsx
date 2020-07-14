import React from 'react';
import Page from './Page';
import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <Page title="not found">
      <div className="text-center">
        <h2>This page not found</h2>
        <p className="lead text-muted">
          you can always back to <Link to={`/`}>home</Link> page
        </p>
      </div>
    </Page>
  );
}

export default NotFound;
