import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import gsap from 'gsap'
import { Suspense, useRef, forwardRef, useImperativeHandle } from 'react'
import { Model } from 'react-babylonjs'
import '@babylonjs/loaders/glTF'
import { Color3 } from '@babylonjs/core'
export default forwardRef((props: any, ref: any) => {
  // const baseUrl =
  //   'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/'
  // const [avocadoYPos, setAvocadoYPos] = useState(-1.5)
  const rollerRef = useRef<any>(null)
  useImperativeHandle(ref, () => ({
    setRollerRotate: (x: number, duration: number) => {
      gsap.to(rollerRef.current.rotation, {
        x,
        duration,
        ease: 'none',
        onComplete: () => {},
      })
    },
  }))

  return (
    <Suspense
      fallback={<box name="fallback" position={new Vector3(-2.5, -1.5, 0)} />}
    >
      <Model
        rotation={new Vector3(0, 0, 0)}
        position={new Vector3(0, 0, 0)}
        rootUrl="/models/musicbox2/"
        sceneFilename="device.gltf"
        scaling={new Vector3(1, 1, 1)}
        name="musicbox"
      />
      <Model
        rotation={new Vector3(0, 0, 0)}
        position={new Vector3(0, 1.328, -0.399)}
        rootUrl="/models/musicbox2/"
        sceneFilename="rollerf.gltf"
        scaling={new Vector3(1, 1, 1)}
        name="roller"
        ref={rollerRef}
      />

      {new Array(88).fill(0).map((_, index: number) => {
        console.log(0.685 - index * 0.001)
        return (
          <box
            name={'stick' + index}
            key={index}
            width={0.01}
            height={0.001}
            depth={0.5}
            position={new Vector3(0.689 - index * 0.01578, 1.11, 0)}
            // overlayColor={Color3.FromHexString('#555')}
            // faceColors={Color3.FromHexString('#555')}
            // outlineColor={Color3.FromHexString('#555')}
          >
            <standardMaterial
              name="mat"
              diffuseColor={Color3.FromHexString('#555')}
            />
          </box>
        )
      })}
    </Suspense>
  )
})
