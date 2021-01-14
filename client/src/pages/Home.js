import React from 'react';
import ThoughtList from '../components/ThoughtList';

import { useQuery } from '@apollo/react-hooks';
import { QUERY_THOUGHTS } from '../utils/queries';

const Home = () => {
  const { loading, data } = useQuery(QUERY_THOUGHTS);
  const thoughts = data?.thoughts ||  [];
  console.log('thoughts', thoughts);

  return (
    <main>
      <div className='flex-row justify-space-between'>
        <div className='col-12 mb-3'>
          {
            loading ? (
              <div>Loadin'...</div>
            ) : (
              <ThoughtList thoughts={thoughts} title='Emptiest Heads, Fewest Thoughts' />
            )
          }
        </div>
      </div>
    </main>
  );
};

export default Home;
