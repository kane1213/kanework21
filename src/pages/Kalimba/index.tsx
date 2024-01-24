import { useEffect, useState, useMemo, useRef, createRef } from "react";
import { Sprite, Stage, Container, TilingSprite, Text, NineSlicePlane } from "react-pixi-fiber";
import AnimatedSprite from '@/components/AnimationSprite';
import audioData from '@/lib/kalimba.js';
import _ from 'lodash';
import { Midi } from '@tonejs/midi'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import gsap from "gsap";
gsap.registerPlugin(MotionPathPlugin);
// import _ from 'lodash'
import { Texture } from "pixi.js";
import { useLocation } from "react-router-dom";
// import noteBall from '/public/images/musicbox/noteball.png';

import bricksframe from '/public/images/kalimba/bricksframe.png';
import woodConsole from '/public/images/kalimba/console.png';
import stick from '/public/images/kalimba/stick1.png';
import stickDark from '/public/images/kalimba/stick1_d.png';

import cb from '/public/images/kalimba/blue.png';
import cy from '/public/images/kalimba/yellow.png';
import cr from '/public/images/kalimba/red.png';

import './style.scss'
export default (props: any) => {

  let VIDEO_WIDTH: number = 300
  let MUSICBOX_TITLE: string = ''
  let MUSICBOX_SUBTITLE: string = ''
  let forbidNote: string[] = []
  let START_HEIGHT = 0
  let REPEAT = false
  let SHOWARROW = false

  if (!!window.location.search) {
    const query = window.location.search.replace('?', '').split('&').reduce((sum: any, str: string) => {
      const [key, value] = str.split('=')
      return ({ ...sum, [key]: value})
    }, {})
    if (query.hasOwnProperty('wide')) VIDEO_WIDTH = 420
    
    forbidNote = query?.forbid ? query.forbid.replaceAll('%23', '#').split(',') : []
    MUSICBOX_TITLE = query.title ? decodeURI(query.title) : ''
    MUSICBOX_SUBTITLE = query.subtitle ? decodeURI(query.subtitle) : ''
    if (query?.start) START_HEIGHT = query.start
    if (query?.ytId) ytId = query?.ytId
    if (query?.showArrow) SHOWARROW = true
    if (query?.repeat) REPEAT = true
  }

  const CANVAS_WIDTH: number = 464
  const CANVAS_HEIGHT: number = 825
  const NOTE_GAP: number = 100
  const DURATION: number = .1 / 7.5

  const location = useLocation()
  const [name, chosens] = (location.pathname.split('/').slice(-2))
  const [chosen, setChosen] = useState<number[]>(chosens.split(',').map((val: string) => parseInt(val)) || [])
  const [midiTracks, setTracks] = useState<any>([])
  const [notes, setNotes] = useState<any>([])
  const [musicMidi, setMusicMidi] = useState<string>(name)
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const hideNotes = !!localStorage.getItem('hideNotes')
    ? JSON.parse(localStorage.getItem('hideNotes'))
    : []
  
  let player = useRef<any>()
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

    const showNotes = notes.filter((_note:any) => !hideNotes.some((_hideNote:any) => _hideNote.midi === _note.midi && _hideNote.time === _note.time))

    const groupNotes = _.groupBy(showNotes, 'name')
    const useNumber: number[] = _.uniq(Object.keys(groupNotes).map((key: string) => parseInt(key.slice(-1)[0])))
    const _notes = useNumber.reduce((sum: any, num: number) => {
      keyboards[num].forEach((key: string) => {
        const noteKey = `${key}${num}`
        sum[noteKey] = groupNotes.hasOwnProperty(noteKey) && audioData.hasOwnProperty(noteKey) && !forbidNote.includes(noteKey)
          ? _.uniqBy(groupNotes[noteKey], (note: any) => Math.floor(note.time * 7.5)) 
          : []
        // sum[noteKey] = groupNotes.hasOwnProperty(noteKey) 
        //   ? groupNotes[noteKey] 
        //   : []
      })
      return sum
    }, {})
    return _notes


  }, [notes])

  const NOTE_SIZE: number = 14
  const gaspRef = useRef<any>();
  const stageRef = createRef<any>();
  const mainContainer = createRef<any>();
  const notesRef = useRef<any>();
  const aniContainer = useRef<any>({});
  const maskRef = createRef<any>();
  const finishNotes = useRef<any>([]);
  const process = createRef<number>();

  function playAudioByNoteText (text: string) {
    if (!text) return
    playAudio(text, 0, 1.5)
    aniContainer.current[text]()
  }

  function copyToClipboard(text: string) {
    var textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }

  function playAudio(text: string, time: number, duration: number) {
    const base64Data = audioData[text]
    var audio = audioContext.createBufferSource();
    const gainNode = audioContext.createGain();
    // (['A1', 'E1', 'B1', 'G1','A2', 'E2', 'B2', 'G2', 'E3', 'A3', 'C3', 'G3'].some((k: string) => k === text))
    // gainNode.gain.value = parseInt(text.slice(-1)[0]) <= 3
    //   ? 0.7
    //   : 1
    try {
      // 解碼音樂 base64 字串
      audioContext.decodeAudioData(base64ToArrayBuffer(base64Data), function (buffer) {
          // 設置 Audio 元素的音訊緩衝
          audio.buffer = buffer;
          // 連接 Audio 元素到音訊輸出
          gainNode.connect(audioContext.destination);
          audio.connect(gainNode);
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
    // const { tracks } = await Midi.fromUrl(`/public/music/midi/${name}.mid`)
    const _name = name.includes('.mid')
      ? name
      : `/public/music/midi/${name}.mid`;
    const { tracks } = await Midi.fromUrl(_name)
    const _tracks = tracks.filter((track: any) => track.notes.length > 0)
    setTracks(_tracks)
  }

  function musicBoxStart () {

    gaspRef.current = gsap.to(notesRef.current, {
      y: 0,
      duration: notesRef.current.height * DURATION,
      ease: "none",
      // delay: 0.5,
      onStart() {
        finishNotes.current = []
      },
      onUpdate() {
        const currentY = Math.floor(notesRef.current.y)
        const equalZeroSprite = notesRef.current.children
          .filter((child: any) => !finishNotes.current.includes(child))
          .filter((child: any, index: number) => {
            return Math.floor(notesRef.current.height + currentY) - child.y > 370
          })
        if (equalZeroSprite.length > 0) {
          finishNotes.current = finishNotes.current.concat(equalZeroSprite)
          equalZeroSprite.forEach((sprite: any) => {{
            playAudioByNoteText(sprite.alt);
          }})
          showProcess(notesRef.current.height, notesRef.current.y)
        }
      },
      onComplete() {
        notesRef.current.y = (CANVAS_HEIGHT * .5 + 5) - parseInt(START_HEIGHT)
        finishNotes.current = []
        if (REPEAT) musicBoxStart()
      }
    })
  }

  function showProcess (height: number, y: number) {
    const _process = Math.floor((Math.abs(y)/Math.abs(height) * 100)) + 2
    if (process.current != _process) {
      process.current = _process
      document.title = process.current + '%'
    }
  }

  function initMusicEvent () {
    
    if (chosen.length === 0) return

    const _notes: any = midiTracks.filter((_: any, index: number) => chosen.includes(index)).flatMap((track: any) => {
      const _newNotes = track.notes.map((note: any) => ({ ...note, name: note.name.replace('#', ''), time: note.time }))
      return _newNotes
    })
    notesRef.current.y = -_notes.slice(-1)[0].time * NOTE_GAP
    notesRef.current.mask = maskRef.current;
    const _noteList = _notes.slice()
    setNotes(_noteList)
    
  }
  
  function playMusicEvent (event: any) {
    // copyToClipboard(`【懷舊】 ${MUSICBOX_TITLE} - ${MUSICBOX_SUBTITLE} Music Box 引用的影片 https://www.youtube.com/watch?v=${ytId}`)
    if (!!gaspRef.current) {
      if (gaspRef.current.paused()) {
        
        
        if (event.ctrlKey) {
          notesRef.current.y = (CANVAS_HEIGHT * .5 + 5) - parseInt(START_HEIGHT)
          finishNotes.current = []
          gaspRef.current.restart()
        } else {
          gaspRef.current.resume()
        }
      } else {
        gaspRef.current.pause()
      }
      return
    }


    if (notes.length > 0) {
      musicBoxStart()
    }

  }

  useEffect(() => {
    readMidiFile(musicMidi)

    // wheelRefOne.current.mask = wheelMaskRef.current
    // wheelRefTwo.current.mask = wheelMaskRef.current

    // gsap.to(wheelRefOne.current, { y: -40, duration: 1, repeat: -1, ease: "linear" })
    // gsap.to(wheelRefTwo.current, { y: -40, duration: 1, repeat: -1, ease: "linear" })
    
    // if (!!ytId) handleVideo()
    if (mainContainer.current) {
      setTimeout(() => {
        const scale: number = CANVAS_WIDTH / mainContainer.current.width
        console.log({ scale, current: mainContainer.current })
        // mainContainer.current.scale = scale;

        mainContainer.current.width *= scale
        mainContainer.current.height *= scale

        // mainContainer.current.x = (CANVAS_WIDTH - mainContainer.current.width) * .5
        // mainContainer.current.y = (CANVAS_HEIGHT - mainContainer.current.height) * .5
      }, 0)
    }

  }, [])
  useEffect(() => {

    if (midiTracks.length === 0) return
    
    initMusicEvent()
    
  }, [midiTracks])

 
  const notekeys: string[] = Object.keys(audioData).filter((k: string)=>!k.includes('6'))
  const stickWidth: number = 20
  const cubes = [cb, cr, cy]

  return <div className={SHOWARROW ? '' : 'cursor-none'}>
  <Stage ref={stageRef} options={{height: CANVAS_HEIGHT, width: CANVAS_WIDTH, background: '#fff' }} >
    <Container ref={mainContainer} x={0} y={0}>
      <Sprite  texture={Texture.from(woodConsole)} interactive={true} onpointerdown={playMusicEvent}  />
      <Sprite texture={Texture.from(bricksframe)} y={10} x={15} />
    </Container>

    <Sprite ref={maskRef} width={CANVAS_WIDTH - 70} height={348} texture={Texture.WHITE} x={35}  y={17} tint="0x000000" />
    <Container x={27} y={430}>
      {
        notekeys.map((key: string, index: number) => <AnimatedSprite 
          onpointerdown={() => {
            console.log(key)
            playAudioByNoteText(key)
          }}
          getPlay={(play: any) => {
            aniContainer.current = { ...aniContainer.current, [key]: play }
          }}
          speed={0.25}
          texture={[stick, stickDark]} key={key} x={ index * 16.5 }  width={stickWidth} height={50 + (200 - Math.abs( (notekeys.length * .5) - index) * 12) }  />)
      }
      
    </Container>

    <Container ref={notesRef} x={30}>
      {
        ...Object.entries(noteNameGroup).filter(([_, notes]: any) => notes.length > 0).map(( [key, notes]: any, notesIndex: number): any => {
          return notes.map((note: any, noteIndex: number) => {
            

            return <Sprite alt={key} eventMode="dynamic" onclick={(event: any) => {
                if (event.ctrlKey) {
                  const { midi, time } = note
                  hideNotes.push({ midi, time})
                  localStorage.setItem('hideNotes', JSON.stringify(hideNotes))
                  setNotes((_notes: any) => _notes.filter((_note: any) => _note !== note) )
                } else {
                  playAudioByNoteText(key)
                }
              }
              }  texture={Texture.from(cubes[Math.floor(3 * Math.random())])} key={key + '-' + notesIndex + '-' + noteIndex} width={NOTE_SIZE} height={NOTE_SIZE}  x={notekeys.findIndex((k: string) => k === key) * NOTE_SIZE} y={note.time * NOTE_GAP} zIndex={noteIndex}>  
              {/* <Text x={1} y={3}  style={{ fill: '#ffffff', fontSize: 8, align: 'center' }} text={key} /> */}
            </Sprite>
          })
        })
      }
    </Container>
  </Stage>

  <div className={`text-frame ${VIDEO_WIDTH > 300 ? 'wide':''}`}>
    <div className="title">{ MUSICBOX_TITLE }</div>
    <div className="sub">{ MUSICBOX_SUBTITLE }</div>
  </div>
  

  </div>
  
}