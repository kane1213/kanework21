import { Engine, Scene } from 'react-babylonjs'
// import SpinningBox from './components/Spinbox'
import MusicBox from './components/MusicBox'
import { Vector3, Color3 } from '@babylonjs/core'
import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { Midi } from '@tonejs/midi'
import { kNotes } from '@/lib/util'
import _ from 'lodash'
import audioData from '@/lib/box-ogg2.js'
interface NoteData {
  name: string
  time: number
}

export default () => {
  const [notes, setNotes] = useState<NoteData[]>([])
  const radius = 0.27
  const groupRef = useRef<any>(null)
  const boxRef = useRef(null)
  const musicBoxRef = useRef<any>(null)
  const rollerRef = useRef<any>(null)
  const targetRef = useRef<any[]>([])
  const playedRef = useRef<any[]>([])
  const allNotes = useRef<NoteData[]>([])
  const audioContext = new (window.AudioContext || window.webkitAudioContext)()
  const [round, setRound] = useState<number>(0)
  const [name, chosens] = location.pathname.split('/').slice(-2)
  const chosenList = chosens.split(',').map((val: string) => parseInt(val))

  async function readMidiFile(name: string = 'twinkle_twinkle') {
    // const { tracks } = await Midi.fromUrl(`/public/music/midi/${name}.mid`)
    const _name = name.includes('.mid')
      ? name
      : `/public/music/midi/${name}.mid`
    const { tracks } = await Midi.fromUrl(_name)

    // chosenList
    const _tracks = tracks.filter(
      (track: any, index: number) =>
        chosenList.includes(index) && track.notes.length > 0
    )
    // setTracks(_tracks)
    const _notes = _tracks.flatMap((track: any) =>
      track.notes.map((note: any) => ({ name: note.name, time: note.time }))
    )

    // const roundTime = _notes.slice(-1)[0].time + 1
    // const newNotes = _.cloneDeep(_notes).map((note: any) => ({
    //   ...note,
    //   time: note.time + roundTime,
    // }))

    // setNotes(_notes.concat(newNotes))
    allNotes.current = _.uniqWith(_notes, _.isEqual)

    // console.log(allNotes.current.slice(0, 100))
    // allNotes.current = _notes.concat(newNotes)
    // setNotes(_notes)

    // setNotes(
    //   _tracks.flatMap((track: any) =>
    //     track.notes.map((note: any) => ({ name: note.name, time: note.time }))
    //   )
    // )
    caculateNotes()
  }

  function caculateNotes(currentRotate: number = 0) {
    setNotes(() => {
      return allNotes.current.filter((note: NoteData) => {
        const _currentNoteRotate = note.time * 30 - currentRotate
        return _currentNoteRotate > -180 && _currentNoteRotate < 180
      })
    })
  }
  // useEffect(() => {
  //   console.log(notes.length)
  // }, [notes])

  const gsapupdate = _.throttle(
    () => {
      if (!boxRef.current) return

      const _currentRound = Math.floor(
        groupRef.current.rotation._x / (Math.PI / 180) / 360
      )

      // if (!!musicBoxRef.current) {
      //   // musicBoxRef.current.rotation._x = groupRef.current.rotation._x
      //   console.log(musicBoxRef.current.rotation)
      // }

      caculateNotes(groupRef.current.rotation._x / (Math.PI / 180))

      if (round !== _currentRound) {
        setRound(_currentRound)
      }

      targetRef.current
        .filter((sphere: any) => !playedRef.current.includes(sphere))
        .forEach((target) => {
          // console.log(groupRef.current.rotation._x)

          // const wholeRound = (notes.slice(-1)[0].time * 30 + 120) / 360
          // const _rotate = target.time * 30
          // const isActive =
          //   _rotate >= currentRotate.start && _rotate < currentRotate.end

          // console.log({ target })

          if (
            target.visibility >= 1 &&
            boxRef.current.intersectsMesh(target, true)
          ) {
            // console.log('Collision Detected with Target ' + target.name)
            playedRef.current.push(target)
            playAudio(target.name)
          }
        })
    },
    100,
    { trailing: false }
  )

  useEffect(() => {
    readMidiFile(name) // 'Tetris'
  }, [])

  const startRotate = () => {
    if (groupRef.current.length === 0) return
    // console.log(groupRef.current.slice(-1)[0].time * 30)
    setTimeout(() => {
      // console.log(allNotes.current.slice(-1)[0].time * 30 + 150)
      const x =
        (Math.PI / 180) * (allNotes.current.slice(-1)[0].time * 30 + 180)
      const duration = allNotes.current.slice(-1)[0].time
      if (!!groupRef.current?.rotation) {
        gsap.to(groupRef.current.rotation, {
          // x: (Math.PI / 180) * 360,
          x,
          duration,
          ease: 'none',
          // repeat: -1,
          onUpdate() {
            gsapupdate()
          },
          onRepeat() {
            playedRef.current = []
          },
          // onComplete() {
          //   playedRef.current = []
          // },
        })
      }
      musicBoxRef.current.setRollerRotate(x, duration)

      // if (rollerRef.current?.rotation) console.log(rollerRef.current?.rotation)
      // gsap.to(rollerRef.current?.rotation, {
      //   // x: (Math.PI / 180) * 360,
      //   x: (Math.PI / 180) * 3600,
      //   duration: 10,
      //   ease: 'none',
      // })
      // rollerRef.current.scaling._x = 0
    }, 100)
  }

  function base64ToArrayBuffer(base64: string) {
    var binary_string = window.atob(base64.split(',')[1])
    var len = binary_string.length
    var bytes = new Uint8Array(len)
    for (var i = 0; i < len; i++) {
      bytes[i] = binary_string.charCodeAt(i)
    }
    return bytes.buffer
  }

  function playAudio(text: string) {
    const base64Data = audioData[text]
    var audio = audioContext.createBufferSource()
    const gainNode = audioContext.createGain()
    gainNode.gain.value = parseInt(text.slice(-1)[0]) <= 3 ? 0.7 : 1
    try {
      // 解碼音樂 base64 字串
      audioContext.decodeAudioData(
        base64ToArrayBuffer(base64Data),
        function (buffer) {
          // 設置 Audio 元素的音訊緩衝
          audio.buffer = buffer
          // 連接 Audio 元素到音訊輸出
          gainNode.connect(audioContext.destination)
          audio.connect(gainNode)
          // 播放音樂
          audio.start()
        }
      )
      // const audio = new Audio(base64Data)
      // audio.play()
    } catch (error) {
      console.log({ text, error })
    }
  }

  const registSphere = (sphere: any) => {
    targetRef.current.push(sphere)
  }

  return (
    <Engine
      antialias
      adaptToDeviceRatio
      canvasId="babylonJS"
      onClick={startRotate}
    >
      <Scene>
        <arcRotateCamera
          allowUpsideDown={false}
          name="camera1"
          target={Vector3.Zero()}
          alpha={Math.PI / 2}
          beta={Math.PI / 4}
          radius={5}
          // rotation-x={(90 * Math.PI) / 180}
          wheelPrecision={300}
        />
        <hemisphericLight
          name="light1"
          intensity={2.7}
          direction={Vector3.Up()}
        />
        {/* <SpinningBox
          name="left"
          position={new Vector3(0, 0, 0)}
          color={Color3.FromHexString('#EEB5EB')}
          hoveredColor={Color3.FromHexString('#C26DBC')}
        /> */}
        <MusicBox ref={musicBoxRef} />
        <mesh
          ref={groupRef}
          name="mesh"
          position={new Vector3(0, 1.328, -0.399)}
          rotation={new Vector3(0, 0, 0)}
        >
          {notes.map((note: NoteData) => {
            const angel = note.time * -30 // - 180
            return (
              <sphere
                key={angel + note.name}
                name={note.name}
                // visibility={isActive ? 1 : 0}
                position={
                  new Vector3(
                    // index * 0.015,
                    0.6815 - kNotes.indexOf(note.name) * 0.0165,
                    radius * Math.cos((angel * Math.PI) / 180),
                    radius * Math.sin((angel * Math.PI) / 180)
                  )
                }
                scaling={new Vector3(0.015, 0.015, 0.015)}
                // onCollideObservable={handleCollisionEnter}
                onCreated={registSphere}
                // onCollisionEnter={handleCollisionEnter}
                // onCollisionExit={handleCollisionExit}
                // overlayColor={Color3.FromHexString('#000000')}
              >
                <standardMaterial
                  name="mat"
                  diffuseColor={Color3.FromHexString('#555')}
                />
              </sphere>
            )
          })}

          {/* {new Array(88)
            .fill(0)
            .map((_, i) => (360 / 88) * i)
            .map((angel, index: number) => (
              <sphere
                key={angel}
                name="sphere1"
                position={
                  new Vector3(
                    // index * 0.015,
                    0.6815 - index * 0.016,
                    radius * Math.cos((angel * Math.PI) / 180),
                    radius * Math.sin((angel * Math.PI) / 180)
                  )
                }
                scaling={new Vector3(0.01, 0.01, 0.01)}
                // overlayColor={Color3.FromHexString('#000000')}
              />
            ))} */}

          {/* <sphere
            name="sphere1"
            position={new Vector3(0, 0.5, 0)}
            // rotation={new Vector3(0, (30 * Math.PI) / 180, 0)}
            scaling={new Vector3(0.1, 0.1, 0.1)}
            // overlayColor={Color3.FromHexString('#000000')}
          /> */}
        </mesh>
        <box
          ref={boxRef}
          visibility={0}
          name="target"
          width={1.35}
          height={0.00001}
          depth={0.05}
          position={new Vector3(0, 1.11, -0.25)}
        />
      </Scene>
    </Engine>
  )
}
