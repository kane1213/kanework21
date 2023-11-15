import { useEffect, useState, useMemo, useRef, createRef } from "react";
import { Sprite, Stage, Container, TilingSprite } from "react-pixi-fiber";
// import { AnimatedSprite } from 'pixi'
import audioData from '@/lib/box-ogg2.js';
import { Midi } from '@tonejs/midi'
import gsap from "gsap";
import _ from 'lodash'
import { Texture, AnimatedSprite } from "pixi.js";
import { useNavigate, useLocation } from "react-router-dom";
import noteBall from '/public/images/musicbox/noteball.png';
import kone from '/public/images/musicbox/key1.png';
import ktwo from '/public/images/musicbox/key2.png';
import gear from '/public/images/musicbox/gear.png';
import wheel from '/public/images/musicbox/wheel.png';
import wood from '/public/images/musicbox/musicBoxWood.png';
import metal from '/public/images/musicbox/metal.png';
interface NoteData {
  midi: number,
  name: string,
  time: number,
  duration: number
}

const KeySprite = new AnimatedSprite([
  Texture.from(kone),Texture.from(kone),Texture.from(kone),Texture.from(kone),Texture.from(kone),Texture.from(kone),Texture.from(kone),Texture.from(kone),Texture.from(kone),Texture.from(kone),
  Texture.from(ktwo),Texture.from(ktwo),Texture.from(ktwo),Texture.from(ktwo),Texture.from(ktwo),Texture.from(ktwo),Texture.from(ktwo),Texture.from(ktwo),Texture.from(ktwo),Texture.from(ktwo),
]); 

export default (props: any) => {
  const CANVAS_WIDTH: number = 1280
  const CANVAS_HEIGHT: number = 720
  const location = useLocation()
  const [name, chosens] = (location.pathname.split('/').slice(-2))
  const [chosen, setChosen] = useState<number[]>(chosens.split(',').map((val: string) => parseInt(val)) || [])
  const [midiTracks, setTracks] = useState<any>([])
  const [notes, setNotes] = useState<any>([])
  const [musicMidi, setMusicMidi] = useState<string>(name)
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  // const [audios, setAudios] = useState<HTMLAudioElement[]>()

  // const noteTimes = useMemo(() => notes.length > 0 ? _.uniq(_.map(notes, 'time')) : [], [notes])
  const defaultKeys = ['C', 'Cb', 'C#', 'D', 'Db', 'D#', 'E', 'F', 'Fb', 'F#', 'G', 'Gb', 'G#', 'A', 'Ab', 'A#', 'B']
  const keyboards = {
    0: defaultKeys.slice(-2),
    1: defaultKeys.slice(),
    2: defaultKeys.slice(),
    3: defaultKeys.slice(),
    4: defaultKeys.slice(),
    5: defaultKeys.slice(),
    6: defaultKeys.slice(),
    7: defaultKeys.slice(),
    8: defaultKeys.slice(0, 1),
  }

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

  const NOTE_SIZE: number = 16

  const stageRef = createRef<any>();
  const bunnyRef = createRef<any>();
  // const playingLineRef = createRef<any>();
  const maskRef = createRef<any>();
  const media_recorder = useRef<any>();
  const finishNotes = useRef<any>([]);

  function playAudioByNoteText (text: string) {
    playAudio(audioData[text], 0, 1.5)
  }

  function playAudio(base64Data: any, time: number, duration: number) {
    var audio = audioContext.createBufferSource();
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
      bunnyRef.current.y = CANVAS_HEIGHT * .5 + 5
      bunnyRef.current.mask = maskRef.current;
      gsap.to(bunnyRef.current, {
        y: -bunnyRef.current.height,
        duration: bunnyRef.current.height * .025,
        ease: "none",
        // delay: 0.5,
        onStart() {
          // console.log(bunnyRef.current.children)
        },
        onUpdate() {
          const currentY = Math.floor(bunnyRef.current.y)
          const equalZeroSprite = bunnyRef.current.children
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
          console.log(media_recorder.current)
          media_recorder.current.stop()
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
    const _noteList = _notes.slice(0, 550)
    setNotes(_noteList)
  }

  useEffect(() => {
    readMidiFile(musicMidi)
    
    // stageRef.current._app.current.stage.addChild(KeySprite)
    // KeySprite.gotoAndPlay(0)
    // KeySprite.play()
    // KeySprite.play()
  }, [])

  const widthLength: number = Object.entries(noteNameGroup).filter(([_, notes]: any) => notes.length > 0).length

  return <>
  <Stage ref={stageRef} options={{height: CANVAS_HEIGHT, width: CANVAS_WIDTH, background: '#f7ffd6' }} onClick={playMusicEvent}>

    
    {/* <Sprite ref={playingLineRef} width={heightLength * NOTE_SIZE} height={1} texture={Texture.WHITE} tint="0x000000" x={0} y={CANVAS_HEIGHT * .5} zIndex={1000} /> */}

    <Container x={(CANVAS_WIDTH - 1240) * .5} y={(CANVAS_HEIGHT - 548) * .5}>
      <Sprite width={1240} height={548} texture={Texture.from(wood)} x={0} y={0} />
      <Sprite ref={maskRef} width={1000} height={261} texture={Texture.WHITE} x={121}  y={8} tint="0x000000" />
      <TilingSprite texture={Texture.from(wheel)} width={130} height={315} y={-15} x={-9} />
      <TilingSprite texture={Texture.from(metal)} width={1000} height={260} y={9} x={121} />
      <TilingSprite texture={Texture.from(wheel)} width={130} height={315} y={-15} x={1119} />
      <Sprite texture={Texture.WHITE} tint="0x5e5e5e" width={998} height={50} x={121} y={399} />

      <Sprite texture={Texture.from(gear)} width={41} height={41}  x={124} y={403} />
      <Sprite texture={Texture.from(gear)} width={41} height={41}  x={604} y={403} />
      <Sprite texture={Texture.from(gear)} width={41} height={41}  x={1074} y={403} />
      
      
    </Container>

    {/* <Sprite ref={maskRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT * .5} texture={Texture.WHITE} tint="0x000000" x={0} /> */}
    <Container ref={bunnyRef} x={(CANVAS_WIDTH - widthLength * 16) * .5}>
      {
        ...Object.entries(noteNameGroup).filter(([_, notes]: any) => notes.length > 0).map(( [key, notes]: any, notesIndex: number): any => {
          return notes.map((note: any, noteIndex: number) => {
            return <Sprite eventMode="dynamic" onclick={() => {playAudioByNoteText(key)}}  texture={Texture.from(noteBall)} alt={key} key={key + '-' + notesIndex + '-' + noteIndex} width={NOTE_SIZE} height={NOTE_SIZE}  x={(notesIndex) * NOTE_SIZE} y={note.time * 60} zIndex={noteIndex}>  
              {/* <Text x={1} y={3}  style={{ fill: '#ffffff', fontSize: 8, align: 'center' }} text={key} /> */}
            </Sprite>
          })
          // return <Sprite key={key + notesIndex} width={20} height={20} texture={Texture.WHITE} tint="0x000000" x={0} y={notesIndex * 20} zIndex={notesIndex} />  
        })
      }
    </Container>
    <Container x={(CANVAS_WIDTH - widthLength * 16) * .5} y={CANVAS_HEIGHT * .5 - 5}>
      {
        ...Object.entries(noteNameGroup).filter(([_, notes]: any) => notes.length > 0).map(((_: any, index: number) => 
          <Sprite texture={Texture.from(kone)} width={15} height={130} x={index * 16} />
        ))
      }

    </Container>
    
  </Stage>
  </>
  
}