import { useEffect, useState, useMemo, useRef, createRef } from "react";
import audioData from '@/lib/box-ogg2.js';
import { Midi } from '@tonejs/midi'
import gsap from "gsap";
import _ from 'lodash'
import { useNavigate } from "react-router-dom";


export default () => {
  const router = useNavigate()
  const musics: string[] = DATA_DIRECTORY.filter((name: string) => !name.includes('hide'))
  const [chosen, setChosen] = useState<number[]>([])
  const [midiTracks, setTracks] = useState<any>([])
  const [notes, setNotes] = useState<any>([])
  const [musicMidi, setMusicMidi] = useState<string>('')
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

  const stageRef = createRef<any>();
  const bunnyRef = createRef<any>();
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
    setChosen([0])
  }

  useEffect(() => {
    if (notes.length > 0) {
      
      bunnyRef.current.x = 50
      gsap.to(bunnyRef.current, {
        x: -bunnyRef.current.width,
        duration: bunnyRef.current.width * .025,
        ease: "none",
        // delay: 0.5,
        onStart() {
          // console.log(bunnyRef.current.children)
        },
        onUpdate() {
          const currentX = Math.floor(bunnyRef.current.x)
          
          const equalZeroSprite = bunnyRef.current.children
            .filter((child: any) => !finishNotes.current.includes(child))
            .filter((child: any) => Math.floor(child.x + currentX) < 0)
          if (equalZeroSprite.length > 0) {
            finishNotes.current = finishNotes.current.concat(equalZeroSprite)
            equalZeroSprite.forEach((sprite: any) => {playAudioByNoteText(sprite.alt)})
          }
        },
        onComplete() {
          console.log('done')
          console.log(media_recorder.current)
          media_recorder.current.stop()
        }
      })
    

    
    // recordEvent()

    }
  }, [notes])

  useEffect(() => {
    console.log({ chosen })

  }, [chosen])

  function chosenNewTrack (index: number) {
    if (chosen.includes(index)) {
      setChosen((prev: number[]) => prev.filter((preidx: number) => preidx !== index))
    } else {
      setChosen((prev: number[]) => prev.concat(index))
    }
  }

  function chosenMusicEvent (name: string) {
    if (musicMidi === name) {
      setMusicMidi('')
    } else {
      setMusicMidi(name)
      readMidiFile(name)
    }
  }

  function getToMusic () {
    router(`/music/${musicMidi}/${chosen.join()}`)
  }

  // const filterdNotes: string[] = noteList
  //   .filter((noteName: string) => true || noteNameGroup.hasOwnProperty(noteName))
  // console.log({ noteNameGroup, noteList })

  return <>
  MUSIC LIST
  {/* <div>{ noteTimes.map((time: number) => <div>{time}</div>) }</div> */}

  <div className="mt-3 flex items-center">
    {
      musics.map((music: string, index: number) => <div onClick={() => { chosenMusicEvent(music) }} className={`${musicMidi === music ? 'bg-red-800 text-white': 'border'} px-1 rounded mx-1 cursor-pointer `} key={music + '-' + index}>{ music }</div>)
    }
  </div>
  
  {
    !!musicMidi &&
      <div className="mt-3 flex items-center">
        {
          midiTracks.map((track: any, index: number) => <div onClick={() => { chosenNewTrack(index) }} className={`${chosen.includes(index) ? 'bg-red-800 text-white': 'border'} px-1 rounded mx-1 cursor-pointer `} key={track.name + '-' + index}>{ track.name || 'unknown' }</div>)
        }
      </div>
  }


  {/* <div>{ noteList.length }</div> */}

  <div onClick={getToMusic} className={`cursor-pointer ${chosen.length > 0 ? 'bg-blue-600 text-white':' border'} inline-block rounded px-6 py-2 text-2xl mt-8 ml-8`}>
    GO
  </div>

  </>
}