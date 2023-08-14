import { useState } from 'react'
import './style.scss'
export default () => {
  const [active, setActive] = useState<number>(1)
  function setActiveEvent (idx: number) {
    setActive(idx)
  }


  return <div className="bg-gray-200 min-h-[95vh] pt-4">
    <div className="w-96 mx-auto bg-gray-100 rounded-t-xl">
      <div className="tabs">
        {
          ['one', 'two', 'three'].map((num: string, idx: number) => <div key={num} onClick={() => { setActiveEvent(idx) }} className={(active === idx ? 'active':'') + ' cursor-pointer'} >{num}</div>)
        }
      </div>

      <div className={`main-content active-${active}`}>
        CONTENT
      </div>

    </div>

    
    <svg width="0" height="0" viewBox="0 0 100 100">
      <defs>
        <clipPath id="clipPathLeft" clipPathUnits="objectBoundingBox">
          <path d="M 1,0 L 1,1 L 0,1 Q 0.95,0.95 1,0 Z"></path>
        </clipPath>
      </defs>
    </svg>

    <svg width="0" height="0" viewBox="0 0 100 100">
      <defs>
        <clipPath id="clipPathRight" clipPathUnits="objectBoundingBox">
          <path d="M 0.994,1 L 0,1.004 L 0,0 Q 0,1.004 0.994,1 Z"></path>
        </clipPath>
      </defs>
    </svg>

  </div> 
}