import dynamic from 'next/dynamic';

const ReadingTime = dynamic(() => import('./ReadingTimeComp'), {
  ssr: false
});

export default ReadingTime;
