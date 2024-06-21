import { createRef, useCallback, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { usePointToPointConstraint, useSphere } from '@react-three/cannon'

const cursor = createRef()

function useDragConstraint(child) {
  const [, , api] = usePointToPointConstraint(cursor, child, { pivotA: [0, 0, 0], pivotB: [0, 0, 0] })
  useEffect(() => void api.disable(), [])
  const onPointerUp = useCallback((e) => {
    document.body.style.cursor = 'grab'
    e.target.releasePointerCapture(e.pointerId)
    api.disable()
  }, [])
  const onPointerDown = useCallback((e) => {
    document.body.style.cursor = 'grabbing'
    e.stopPropagation()
    e.target.setPointerCapture(e.pointerId)
    api.enable()
  }, [])
  return { onPointerUp, onPointerDown }
}

function Cursor() {
  const [, api] = useSphere(() => ({ collisionFilterMask: 0, type: 'Kinematic', mass: 0, args: [0.5] }), cursor)
  return useFrame((state) => {
    const x = state.mouse.x * state.viewport.width
    const y = (state.mouse.y * state.viewport.height) / 1.9 + -x / 3.5
    api.position.set(x / 1.4, y, 0)
  })
}

export { useDragConstraint, cursor, Cursor }
