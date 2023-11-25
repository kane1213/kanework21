import { useEffect, useState, useMemo, useRef, createRef } from "react";
import { Sprite, Stage, Container, TilingSprite } from "react-pixi-fiber";
import AnimatedSprite from '@/components/AnimationSprite';
import audioData from '@/lib/box-ogg2.js';
import { Midi } from '@tonejs/midi'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import gsap from "gsap";
gsap.registerPlugin(MotionPathPlugin);
import _ from 'lodash'
import { Texture } from "pixi.js";
import { useLocation } from "react-router-dom";
import noteBall from '/public/images/musicbox/noteball.png';
import kone from '/public/images/musicbox/key1.png';
import ktwo from '/public/images/musicbox/key2.png';
import gear from '/public/images/musicbox/gear.png';
import wheel from '/public/images/musicbox/wheel.png';
import wood from '/public/images/musicbox/musicBoxWood.png';
import metal from '/public/images/musicbox/metal.png';
import handGear from '/public/images/musicbox/handGear.png'
interface NoteData {
  midi: number,
  name: string,
  time: number,
  duration: number
}

export default (props: any) => {
  const CANVAS_WIDTH: number = 1280
  const CANVAS_HEIGHT: number = 720
  const NOTE_GAP: number = 150
  const TOTAL_NOTES: number = 64
  const DURATION: number = .1 / 10

  const GEAR_HEIGHT: number = 96
  const GEAR_WIDTH: number = 39

  const location = useLocation()
  const [name, chosens] = (location.pathname.split('/').slice(-2))
  const [chosen, setChosen] = useState<number[]>(chosens.split(',').map((val: string) => parseInt(val)) || [])
  const [midiTracks, setTracks] = useState<any>([])
  const [notes, setNotes] = useState<any>([])
  const [musicMidi, setMusicMidi] = useState<string>(name)
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  // const [audios, setAudios] = useState<HTMLAudioElement[]>()

  // const noteTimes = useMemo(() => notes.length > 0 ? _.uniq(_.map(notes, 'time')) : [], [notes])
  const defaultKeys = ['C', 'Cb', 'C#', 'D', 'Db', 'D#', 'E', 'F', 'Fb', 'F#', 'G', 'Gb', 'G#', 'A', 'Ab', 'A#', 'B'].filter((k: string) => !k.includes('b'))
  const keyboards = {
    0: ['A', 'B'],
    1: defaultKeys.slice(),
    2: defaultKeys.slice(),
    3: defaultKeys.slice(),
    4: defaultKeys.slice(),
    5: defaultKeys.slice(),
    6: defaultKeys.slice(),
    7: defaultKeys.slice(),
    8: ['C', 'D'],
  }

  const kNotes: string[] = Object.entries(keyboards).reduce((sum: any, kbs: any) => sum.concat(kbs[1].map((k: string) => k + kbs[0])) , [])
  

  
  const noteNameGroup = useMemo(() => {
    if (notes.length === 0) return {}
    const groupNotes = _.groupBy(notes, 'name')
    const useNumber: number[] = _.uniq(Object.keys(groupNotes).map((key: string) => parseInt(key.slice(-1)[0])))
    return useNumber.reduce((sum: any, num: number) => {
      keyboards[num].forEach((key: string) => {
        const noteKey = `${key}${num}`
        sum[noteKey] = groupNotes.hasOwnProperty(noteKey) ? groupNotes[noteKey] : []
      })
      return sum
    }, {})
  }, [notes])

  const NOTE_SIZE: number = (CANVAS_WIDTH - 281) / kNotes.length - 1

  const stageRef = createRef<any>();
  const notesRef = createRef<any>();
  const handGearRef = createRef<any>()
  const aniContainer = useRef<any>({});
  // const playingLineRef = createRef<any>();
  const maskRef = createRef<any>();
  const wheelMaskRef = createRef<any>();
  const wheelRefOne = createRef<any>();
  const wheelRefTwo = createRef<any>();
  // const media_recorder = useRef<any>();
  const finishNotes = useRef<any>([]);

  function playAudioByNoteText (text: string) {
    playAudio(text, 0, 1.5)

    aniContainer.current[text]()
  }

  function playAudio(text: string, time: number, duration: number) {
    const base64Data = audioData[text]
    var audio = audioContext.createBufferSource();

    try {
      // 解碼音樂 base64 字串
      audioContext.decodeAudioData(base64ToArrayBuffer(base64Data), function (buffer) {
          // 設置 Audio 元素的音訊緩衝
          audio.buffer = buffer;
          // 連接 Audio 元素到音訊輸出
          audio.connect(audioContext.destination);
          // 播放音樂
          audio.start();
      });
      // const audio = new Audio(base64Data)
      // audio.play()
      
    } catch (error) {
      console.log({ text, error})
    }

  }
  
  function base64ToArrayBuffer(base64: string) {
    var binary_string = window.atob(base64.split(',')[1]);
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}


  async function readMidiFile(name: string) {
    const { tracks } = await Midi.fromUrl(`/public/music/midi/${name}.mid`)
    // const { tracks } = await Midi.fromUrl(name)
    const _tracks = tracks.filter((track: any) => track.notes.length > 0)
    setTracks(_tracks)
  }

  useEffect(() => {
    if (notes.length > 0) {
      notesRef.current.y = CANVAS_HEIGHT * .5 + 5
      notesRef.current.mask = maskRef.current;
      gsap.to(notesRef.current, {
        y: -notesRef.current.height,
        duration: notesRef.current.height * DURATION,
        ease: "none",
        // delay: 0.5,
        onStart() {
          // console.log(notesRef.current.children)
        },
        onUpdate() {
          const currentY = Math.floor(notesRef.current.y)
          const equalZeroSprite = notesRef.current.children
            .filter((child: any) => !finishNotes.current.includes(child))
            .filter((child: any) => Math.floor(child.y + currentY) < CANVAS_HEIGHT * .5)
          if (equalZeroSprite.length > 0) {
            finishNotes.current = finishNotes.current.concat(equalZeroSprite)
            equalZeroSprite.forEach((sprite: any) => {{
              playAudioByNoteText(sprite.alt);
            }})
          }
        },
        onComplete() {
          console.log('done')
          console.log({ height: notesRef.current.height, y: notesRef.current.y })
        }
      })
    }
  }, [notes])

  
  function playMusicEvent () {
    if (chosen.length === 0) return
    const _notes: any = midiTracks.filter((_: any, index: number) => chosen.includes(index)).flatMap((track: any) => {
      const _newNotes = track.notes.map((note: any) => ({ ...note, name: note.name, time: note.time }))
      return _newNotes
    })

    if (_notes.length === 0) return
    const _noteList = _notes.slice()
    setNotes(_noteList)
  }

  useEffect(() => {
    readMidiFile(musicMidi)

    const centerX = 0; // 橢圓中心X座標
    const centerY = 0; // 橢圓中心Y座標
    const radiusX = 15;  // X軸半徑
    const radiusY = 10;  // Y軸半徑

    const tl = gsap.timeline({
      onStart: function() {
        gsap.set(handGearRef.current, { x: 160 + centerX - radiusX, y: 10 + centerY });
      },
      onComplete () {
        
      },
      onUpdate: function() {
        // console.log(handGearRef.current.style.left, handGearRef.current.style.top);
      },
      repeat: -1
    })
    // 橢圓形參數
    

    tl.to(handGearRef.current, {
      duration: 2,
      ease: "linear",
      motionPath: {
        path: [
          { x: 160 + centerX - radiusX, y: 10 + centerY },
          { x: 160 + centerX, y: 10 + centerY + radiusY },
          { x: 160 + centerX + radiusX, y: 10 + centerY },
          { x: 160 + centerX, y: 10 + centerY - radiusY },
          { x: 160 + centerX - radiusX, y: 10 + centerY }
        ],
        type: "soft"
      }
    });


    // 
    // tl.from(handGearRef.current, { x: 160, y: 10 });

    // // tl.to(handGearRef.current, { x: 200, y: 10 });

    // tl.to(handGearRef.current , { x: 200, y: 9, duration: 2});

    

    // // tl.to(handGearRef.current, { x: 200, y: 11 });
    
    // tl.to(handGearRef.current, { x: 160, y: 10, duration: 2 });

    // gsap.to(handGearRef.current, { duration: 2, x: 250, ease: "linear", repeat: -1 });
    // gsap.from(handGearRef.current, { duration: 2, x: 160, y: 10, ease: "linear", repeat: -1 });
    // gsap.timeline (handGearRef.current, { duration: 2, x: 200, y: 5, ease: "linear", repeat: -1 });
    // gsap.to(handGearRef.current, { duration: 2, x: 850, y: 10, ease: "linear", repeat: -1 });

    wheelRefOne.current.mask = wheelMaskRef.current
    wheelRefTwo.current.mask = wheelMaskRef.current

    gsap.to(wheelRefOne.current, { y: -40, duration: 1, repeat: -1, ease: "linear" })
    gsap.to(wheelRefTwo.current, { y: -40, duration: 1, repeat: -1, ease: "linear" })
  }, [])

  return <div className="cursor-none">
  <Stage ref={stageRef} options={{height: CANVAS_HEIGHT, width: CANVAS_WIDTH, background: '#f7ffd6' }} onClick={playMusicEvent}>

    <Sprite ref={handGearRef} width={GEAR_WIDTH} height={GEAR_HEIGHT} texture={Texture.from(handGear)} />
 
    <Container x={(CANVAS_WIDTH - 1240) * .5} y={(CANVAS_HEIGHT - 548) * .5}>
      <Sprite width={1240} height={548} texture={Texture.from(wood)} x={0} y={0} />
      <Sprite ref={maskRef} width={1000} height={261} texture={Texture.WHITE} x={121}  y={8} tint="0x000000" />
      <TilingSprite ref={wheelRefOne} texture={Texture.from(wheel)} width={130} height={350} y={-15} x={-9} />
      <TilingSprite texture={Texture.from(metal)} width={1000} height={260} y={9} x={121} />
      <TilingSprite ref={wheelRefTwo} texture={Texture.from(wheel)} width={130} height={350} y={-15} x={1119} />
      <Sprite texture={Texture.WHITE} tint="0x5e5e5e" width={998} height={50} x={121} y={399} />

      <Sprite texture={Texture.from(gear)} width={41} height={41}  x={124} y={403} />
      <Sprite texture={Texture.from(gear)} width={41} height={41}  x={604} y={403} />
      <Sprite texture={Texture.from(gear)} width={41} height={41}  x={1074} y={403} />
      
      <Sprite ref={wheelMaskRef} width={1260} height={315} texture={Texture.WHITE} x={-9}  y={-15} tint="0x0000ff" />
      
    </Container>

    {/* <Sprite ref={maskRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT * .5} texture={Texture.WHITE} tint="0x000000" x={0} /> */}
    <Container ref={notesRef} x={141}>
      {
        ...Object.entries(noteNameGroup).filter(([_, notes]: any) => notes.length > 0).map(( [key, notes]: any, notesIndex: number): any => {
          return notes.map((note: any, noteIndex: number) => {
            return <Sprite eventMode="dynamic" onclick={() => {playAudioByNoteText(key)}}  texture={Texture.from(noteBall)} alt={key} key={key + '-' + notesIndex + '-' + noteIndex} width={NOTE_SIZE} height={NOTE_SIZE}  x={(kNotes.indexOf(key) * (NOTE_SIZE + 1))} y={note.time * NOTE_GAP} zIndex={noteIndex}>  
              {/* <Text x={1} y={3}  style={{ fill: '#ffffff', fontSize: 8, align: 'center' }} text={key} /> */}
            </Sprite>
          })
          // return <Sprite key={key + notesIndex} width={20} height={20} texture={Texture.WHITE} tint="0x000000" x={0} y={notesIndex * 20} zIndex={notesIndex} />  
        })
      }
    </Container>
    <Container x={141} y={CANVAS_HEIGHT * .5 - 5}>
      
      {/* { ...Object.entries(noteNameGroup).filter(([_, notes]: any) => notes.length > 0).map(((note: any, index: number) => 
        {
          return <AnimatedSprite getPlay={(play: any) => {
            aniContainer.current = { ...aniContainer.current, [note[0]]: play }
          }} key={note[0]} speed={90} texture={[kone, ktwo]}  width={15} height={130} x={Math.floor(((TOTAL_NOTES - widthLength) / 2) * NOTE_SIZE) + index * NOTE_SIZE} />

        }
      )) } */}

      {
        kNotes.map((key: string, kIndex: number) => <AnimatedSprite getPlay={(play: any) => {
          aniContainer.current = { ...aniContainer.current, [key]: play }
        }} key={key} speed={90} texture={[kone, ktwo]}  width={NOTE_SIZE} height={130} x={ kIndex * (NOTE_SIZE + 1)} />)

      }

      
    </Container>
    
  </Stage>
  </div>
  
}