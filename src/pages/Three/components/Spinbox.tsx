import { useRef, useState } from 'react'
import { useBeforeRender, useClick, useHover } from 'react-babylonjs'
import { Vector3, Color3, Color4 } from '@babylonjs/core'

export default (props: any) => {
  // access Babylon scene objects with same React hook as regular DOM elements
  const boxRef = useRef(null)

  const [clicked, setClicked] = useState(false)
  useClick(() => setClicked((clicked: boolean) => !clicked), boxRef)

  const [hovered, setHovered] = useState(false)
  useHover(
    () => setHovered(true),
    () => setHovered(false),
    boxRef
  )

  const DefaultScale = new Vector3(1, 1, 1)
  const BiggerScale = new Vector3(1.25, 1.25, 1.25)

  // This will rotate the box on every Babylon frame.
  // const rpm = 5
  // useBeforeRender((scene) => {
  //   if (boxRef.current) {
  //     // Delta time smoothes the animation.
  //     var deltaTimeInMillis = scene.getEngine().getDeltaTime()
  //     boxRef.current.rotation.y +=
  //       (rpm / 60) * Math.PI * 2 * (deltaTimeInMillis / 1000)
  //   }
  // })

  return (
    <box
      name={props.name}
      ref={boxRef}
      size={2}
      position={props.position}
      edgesWidth={8.0}
      edgesColor={Color4.FromInts(0, 0, 0, 0)}
      scaling={clicked ? BiggerScale : DefaultScale}
    >
      <standardMaterial
        name={`${props.name}-mat`}
        diffuseColor={hovered ? props.hoveredColor : props.color}
        specularColor={Color3.Black()}
      />
    </box>
  )
}
