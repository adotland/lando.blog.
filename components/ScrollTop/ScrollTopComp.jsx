

import { useState } from 'react'
import {BsFillCaretUpFill} from 'react-icons/bs';
import styles from './ScrollTop.module.css'

const ScrollTop = () => {
  const [visible, setVisible] = useState(false)

  const toggleVisible = () => {
    const scrolled = document.documentElement.scrollTop
    if (scrolled > 300) {
      setVisible(true)
    } else if (scrolled <= 300) {
      setVisible(false)
    }
  }

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
      /* you can also use 'auto' behaviour
         in place of 'smooth' */
    })
  }

  window.addEventListener('scroll', toggleVisible)

  return (
    <div
      className={styles.scrollTop}
      onClick={scrollToTop}
      style={{ display: visible ? 'inline' : 'none' }}
    >
      <BsFillCaretUpFill size={'sm'}/>
    </div>
  )
}

export default ScrollTop
