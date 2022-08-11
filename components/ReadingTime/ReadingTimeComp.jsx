import { useRef } from 'react';
import styles from './ReadingTimeComp.module.css'
import {FaRegClock} from 'react-icons/fa';

export default function ReadingTimeComp() {

  const timeEl = useRef(null);

  function readingTime() {
    function calc() {
      const text = document.querySelector("article").innerText;
      const wpm = 225;
      const words = text.trim().split(/\s+/).length;
      const time = Math.ceil(words / wpm);
      timeEl.current.innerText = time;
      timeEl.current.style.visibility = "visible";
    }
    setTimeout(() => {
      calc();
    }, 1000);
  }

  return (
    <div className={styles.rtWrap}>
      <div className={styles.rtContent}>
        <FaRegClock />
        <div className={styles.rtText}>Reading time: <span ref={timeEl} onLoad={readingTime()} className={styles.rtTime}>0</span><span> min</span></div>
      </div>
    </div>
  )
}
