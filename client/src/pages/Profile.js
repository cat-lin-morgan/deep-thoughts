import React from 'react';

import { useQuery } from '@apollo/react-hooks'
import { QUERY_USER, QUERY_ME } from '../utils/queries';
import { Redirect, useParams } from 'react-router-dom';

import Auth from '../utils/auth';

import ThoughtList from '../components/ThoughtList';
import FriendList from '../components/FriendList';

const Profile = () => {
  const { username: userParam } = useParams();


  const { loading, data } = useQuery(userParam ? QUERY_USER : QUERY_ME, {
    variables: { username: userParam }
  });
  console.log('hio', data);
  console.log(userParam);

  const user = data?.me || data?.user || {};
  console.log('eeee', Auth.loggedIn(), Auth.getProfile().data.username, userParam);
  if (Auth.loggedIn() && '' === userParam) {
    const profile = Auth.getProfile().data.username;
    return <Redirect to={`/profile/${profile}`} />
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user?.username) {
    return (
      <h4>
        You need to be logged in to see this page. Use the navigation links above to sign up or log in!
      </h4>
    );
  }

  return (
    <div>
      <div className="flex-row mb-3">
        <h2 className="bg-dark text-secondary p-3 display-inline-block">
          Viewing {userParam ? `${user.username}'s` : 'your'} profile.
        </h2>
      </div>

      <div className="flex-row justify-space-between mb-3">
        <div className="col-12 mb-3 col-lg-8">
          <ThoughtList thoughts={user.thoughts} title={`${user.username}'s thoughts...`} />
        </div>
      </div>

      <div className="col-12 col-lg-3 mb-3">
        <FriendList
          username={user.username}
          friendCount={user.friendCount}
          friends={user.friends}
        />
      </div>
    </div>
  );
};

export default Profile;
