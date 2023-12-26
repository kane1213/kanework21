import { useEffect, useState, useMemo, useRef, createRef } from "react";
import { Sprite, Stage, Container, TilingSprite, Text } from "react-pixi-fiber";
import AnimatedSprite from '@/components/AnimationSprite';
import audioData from '@/lib/box-ogg2.js';
import _ from 'lodash';
import { Midi } from '@tonejs/midi'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import gsap from "gsap";
gsap.registerPlugin(MotionPathPlugin);
// import _ from 'lodash'
import { Texture } from "pixi.js";
import { useLocation } from "react-router-dom";
import noteBall from '/public/images/musicbox/noteball.png';
import kone from '/public/images/musicbox/key1.png';
import ktwo from '/public/images/musicbox/key2.png';
import gear from '/public/images/musicbox/gear.png';
import wheel from '/public/images/musicbox/wheel.png';
import wood from '/public/images/musicbox/musicBoxWood3.png';
import metal from '/public/images/musicbox/metal.png';
import pwdBtn from '/public/images/musicbox/powerBtn.png';
import pad from '/public/images/musicbox/pad.png'
import logo from '/public/images/musicbox/logo.png'
import YouTubePlayer from 'youtube-player';
import './style.scss'
export default (props: any) => {

  let VIDEO_WIDTH: number = 300
  let MUSICBOX_TITLE: string = ''
  let MUSICBOX_SUBTITLE: string = ''
  let forbidNote: string[] = []
  let ytId: string = ''
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

  const CANVAS_WIDTH: number = 1280
  const CANVAS_HEIGHT: number = 720
  const NOTE_GAP: number = 100
  const DURATION: number = .1 / 6

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

  const NOTE_SIZE: number = (CANVAS_WIDTH - 281) / kNotes.length - 1
  const gaspRef = useRef<any>();
  const stageRef = createRef<any>();
  const notesRef = useRef<any>();
  // const handGearRef = createRef<any>()
  const aniContainer = useRef<any>({});
  // const playingLineRef = createRef<any>();
  const maskRef = createRef<any>();
  const wheelMaskRef = createRef<any>();
  const wheelRefOne = createRef<any>();
  const wheelRefTwo = createRef<any>();
  const finishNotes = useRef<any>([]);
  const process = createRef<number>();

  function playAudioByNoteText (text: string) {
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
    
    gainNode.gain.value = ([].some((k: string) => k === text)) // 'A3', 'F3', 'D#3', 'G#3', 'C4', 'D#5', 'A#4'
      ? 0.4 
      : 1
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
      y: -notesRef.current.height * 1.25,
      duration: notesRef.current.height * DURATION,
      ease: "none",
      // delay: 0.5,
      onStart() {
        finishNotes.current = []
        // console.log(notesRef.current.children)
      },
      onUpdate() {
        const currentY = Math.floor(notesRef.current.y)
        const equalZeroSprite = notesRef.current.children
          .filter((child: any) => !finishNotes.current.includes(child))
          .filter((child: any) => Math.floor(child.y + currentY) < 260)
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
    notesRef.current.mask = maskRef.current;
    notesRef.current.y = (CANVAS_HEIGHT * .5 + 5) - parseInt(START_HEIGHT)
    if (chosen.length === 0) return
    const _notes: any = midiTracks.filter((_: any, index: number) => chosen.includes(index)).flatMap((track: any) => {
      const _newNotes = track.notes.map((note: any) => ({ ...note, name: note.name, time: note.time }))
      return _newNotes
    })

    const _noteList = _notes.slice()
    setNotes(_noteList)
    
  }
  
  function playMusicEvent (event: any) {
    console.log("start")
    copyToClipboard(`【懷舊】 ${MUSICBOX_TITLE} - ${MUSICBOX_SUBTITLE} Music Box`)
    

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

    wheelRefOne.current.mask = wheelMaskRef.current
    wheelRefTwo.current.mask = wheelMaskRef.current

    gsap.to(wheelRefOne.current, { y: -40, duration: 1, repeat: -1, ease: "linear" })
    gsap.to(wheelRefTwo.current, { y: -40, duration: 1, repeat: -1, ease: "linear" })
    
    if (!!ytId) handleVideo()
    

  }, [])
  useEffect(() => {
    if (midiTracks.length > 0) initMusicEvent()
    
  }, [midiTracks])

  function handleVideo () {
    const width: number = VIDEO_WIDTH
    const videoId = ytId
    player.current = YouTubePlayer('video-player', { videoId, width, height: 255, rates: 2, playVars: { rates: 2 }});

    // , playerVars: {
    //   // controls: 0,
    //   // autoplay: 1,
    //   start: 0,
    //   enablejsapi: 1
    // }, 
    // player.current.loadVideoById('oyWtclsEFgA');
    // player.current.setPlaybackRate(10)
    player.current.mute()
  }

  // function startVideo () {
  //   if (!player.current) return
  //   player.current.playVideo();

  //   document.querySelectorAll('.html5-video-player > div:not(.html5-video-container)').forEach((el: any) => {
  //     el.style.display = 'none'
  //   })
  // }


  return <div className={SHOWARROW ? '' : 'cursor-none'}>
  <Stage ref={stageRef} options={{height: CANVAS_HEIGHT, width: CANVAS_WIDTH, background: '#f7ffd6' }} >
    <Container x={(CANVAS_WIDTH - 1240) * .5} y={25}>
      <Sprite width={1240} height={681} texture={Texture.from(wood)} x={0} y={0}  interactive={true} onpointerdown={playMusicEvent}  />
      <Sprite ref={maskRef} width={1000} height={261} texture={Texture.WHITE} x={121}  y={8} tint="0x000000" />
      <TilingSprite ref={wheelRefOne} texture={Texture.from(wheel)} width={110} height={350} y={-15} x={11} />
      <TilingSprite texture={Texture.from(metal)} width={1000} height={260} y={9} x={121} />
      <TilingSprite ref={wheelRefTwo} texture={Texture.from(wheel)} width={110} height={350} y={-15} x={1119} />
      <Sprite ref={wheelMaskRef} width={1260} height={315} texture={Texture.WHITE} x={-9}  y={-15} tint="0x0000ff" />
      <Sprite width={73} height={73} texture={Texture.from(pwdBtn)} x={1120} y={580} />
      <Sprite texture={Texture.from(logo)} width={154} height={39} x={950} y={600} />
    </Container>

    <Container ref={notesRef} x={141}>
      {
        ...Object.entries(noteNameGroup).filter(([_, notes]: any) => notes.length > 0).map(( [key, notes]: any, notesIndex: number): any => {
          return notes.map((note: any, noteIndex: number) => {
            return <Sprite eventMode="dynamic" onclick={(event: any) => {
                if (event.ctrlKey) {
                  const { midi, time } = note
                  hideNotes.push({ midi, time})
                  localStorage.setItem('hideNotes', JSON.stringify(hideNotes))
                  setNotes((_notes: any) => _notes.filter((_note: any) => _note !== note) )
                } else {
                  console.log({ key })
                  playAudioByNoteText(key)
                }
              }
              }  texture={Texture.from(noteBall)} alt={key} key={key + '-' + notesIndex + '-' + noteIndex} width={NOTE_SIZE} height={NOTE_SIZE}  x={(kNotes.indexOf(key) * (NOTE_SIZE + 1))} y={note.time * NOTE_GAP} zIndex={noteIndex}>  
              {/* <Text x={1} y={3}  style={{ fill: '#ffffff', fontSize: 8, align: 'center' }} text={key} /> */}
            </Sprite>
          })
          // return <Sprite key={key + notesIndex} width={20} height={20} texture={Texture.WHITE} tint="0x000000" x={0} y={notesIndex * 20} zIndex={notesIndex} />  
        })
      }
    </Container>
    <Container x={141} y={264}>
      {
        kNotes.map((key: string, kIndex: number) => <AnimatedSprite getPlay={(play: any) => {
          aniContainer.current = { ...aniContainer.current, [key]: play }
        }} key={key} speed={90} texture={[kone, ktwo]}  width={NOTE_SIZE} height={90} x={ kIndex * (NOTE_SIZE + 1)} />)

      }
    </Container>
    <Container x={20} y={333}>
      <Sprite texture={Texture.from(pad)} width={998} height={50} x={121} />
      <Sprite texture={Texture.from(gear)} width={41} height={41}  x={124} />
      <Sprite texture={Texture.from(gear)} width={41} height={41}  x={604} />
      <Sprite texture={Texture.from(gear)} width={41} height={41}  x={1074} />
      
    </Container>

    
    {/* <Text ref={textTitleRef} text={MUSICBOX_TITLE} style={{ fontSize: 45, fontWeight: 'bold', fill: '#111111', fontFamily: '"Fjalla One", "Source Sans Pro", Helvetica, sans-serif' }} y={CANVAS_HEIGHT * .82} />
    <Text ref={textSecTitleRef} text={MUSICBOX_SUBTITLE} style={{ fontSize: 28, fill: '#111111', fontFamily: '"Fjalla One", "Source Sans Pro", Helvetica, sans-serif' }} y={CANVAS_HEIGHT * .89} /> */}
  </Stage>

  <div className={`text-frame ${VIDEO_WIDTH > 300 ? 'wide':''}`}>
    <div className="title">{ MUSICBOX_TITLE }</div>
    <div className="sub">{ MUSICBOX_SUBTITLE }</div>
  </div>
  
  <div className={`video-frame ${VIDEO_WIDTH > 300 ? 'wide':''}`}>
    <div className="gapside w-10">
      <div className="text-center flex items-center flex-col">
        <div className="light" />
        <div className="text-xs text-white">pwr</div>
      </div>
    </div>
    <div className="overflow-y-hidden video-iframe">
      <div id="video-player" />
    </div>
    <div className="w-10" />
  </div>

  {/* /music/m0894_01/0,3,5 */}
  </div>
  
}