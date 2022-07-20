import dynamic from 'next/dynamic';

const ScrollTop = dynamic(() => import('./ScrollTopComp'), {
  ssr: false
});

export default ScrollTop;
