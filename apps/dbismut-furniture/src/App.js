import React, { useState, useMemo, useRef } from 'react'
import { Scene } from './Scene'

const objects = ['Stool', 'Table', 'Bench']
const models = objects.map((k) => './' + k.toLowerCase() + '.glb')
const fakeObjects = 'Lamp base. Stool. Outside table. Dish drainer. Closet door. Table. Square stool. Clothes rack. Bench. Bird feeder. Shelf. Handeplane surfing. Marking knife. Cutting board. Watch display'.split(
  '. ',
)

const Item = ({ text, onHover, index, active }) => {
  const modelIdx = useMemo(() => objects.indexOf(text), [text])
  const has3d = modelIdx > -1
  return (
    <span className={active ? 'active' : has3d ? '' : 'item'} onPointerEnter={() => has3d && onHover(index)}>
      {text + '.'}
    </span>
  )
}

export default function App() {
  const ref = useRef()
  const [idx, setIdx] = useState(1)
  const modelIdx = objects.indexOf(fakeObjects[idx])
  return (
    <>
      <div className="scene">
        <Scene shownIndex={modelIdx} models={models} target={ref} />
      </div>
      <div className="container" ref={ref}>
        {fakeObjects.map((o, i) => (
          <Item key={i} text={o} active={i === idx} index={i} onHover={setIdx} />
        ))}
      </div>
    </>
  )
}
