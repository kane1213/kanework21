import { useEffect, useState, useMemo, useRef, createRef } from "react";
import { Sprite, Stage, Container, Text } from "react-pixi-fiber";
import audioData from '@/lib/box-ogg2.js';
import { Midi } from '@tonejs/midi'
import gsap from "gsap";
import _ from 'lodash'
import { Texture } from "pixi.js";
interface NoteData {
  midi: number,
  name: string,
  time: number,
  duration: number
}

export default () => {

  // Object.keys(audioData).reduce((sum: any, key: string) => ({...sum, [key]: new AudioContext()}), {})
  const process = useRef<{ time: number, interval: any }>({ time: 0, interval: null })
  // const [currentTime, setCurrentTime] = useState<number>(0)
  const noteList: string[] = Object.keys(audioData).map((key: string) => key)
  const musics: string[] = DATA_DIRECTORY
  
  const [chosen, setChosen] = useState<number[]>([])
  const [midiTracks, setTracks] = useState<any>([])
  const [notes, setNotes] = useState<any>([])
  const [musicMidi, setMusicMidi] = useState<string>('')
  const [play, setPlay] = useState<boolean>(false)
  // const [page, setPage] = useState<number>(1)
  // const timeRate: number = 1
  // const step = useRef<number>(0)
  const soundRef = useRef<any>()
  const videoRef = createRef<any>();
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();

  const noteTimes = useMemo(() => notes.length > 0 ? _.uniq(_.map(notes, 'time')) : [], [notes])
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

    // console.log(Object.keys(groupNotes))
    // defaultKeys

    const useNumber: number[] = _.uniq(Object.keys(groupNotes).map((key: string) => parseInt(key.slice(-1)[0])))
    return useNumber.reduce((sum: any, num: number) => {
      keyboards[num].forEach((key: string) => {
        const noteKey = `${key}${num}`
        sum[noteKey] = groupNotes.hasOwnProperty(noteKey) ? groupNotes[noteKey] : []
      })
      return sum
    }, {})
  }, [notes])

  const keyNames = Object.entries(keyboards).reduce<string[]>((sum, [num, keys]) => sum.concat(keys.map((key: string) => `${key}${num}`)), [])

  const noteTimeRange = useMemo(() => 
    noteTimes.length > 0
      ? { min: _.head(noteTimes), max: _.last(noteTimes)}
      : { min: 0, max: Infinity }
  
  , [noteTimes])
  const gap: number = useMemo<number>(() => {
    if (noteTimes.length === 0) return Infinity

    let minGap = Infinity;
    for (let i = 1; i < noteTimes.length; i++) {
      const gap = noteTimes[i] - noteTimes[i - 1];
      if (gap < minGap) {
        minGap = gap;
      }
    }
    return minGap;
  }, [noteTimes])

  const stageRef = createRef<any>();
  const bunnyRef = createRef<any>();
  const media_recorder = useRef<any>();
  const finishNotes = useRef<any>([]);
  const audioTrack = useRef<any>();


  async function playMusicBox(notes: NoteData[]) {

    const groupNotes = _.groupBy(notes, 'time')



    Object.entries(_.fromPairs(_.sortBy(_.toPairs(groupNotes), [(pair) => parseFloat(pair[0])]))).forEach(([time, notes]: any, idx: number) => {
      notes.forEach((_note: any, index: number) => {
        const extra: number = idx > 0 ? 1:0
        playAudio(audioData[_note.name].split(',')[1], parseFloat(time) + extra , 2)
      })
    })
    
    // step.current += 1
    // notes.forEach((note: any, index: number) => {

    //   if (audioData.hasOwnProperty(note.name)) {
    //     // const start = index > 0 ? 0.5 : 0;
    //     playAudio(audioData[note.name].split(',')[1], note.time , note.duration)
    //   }
    // })
  }

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


    // if (!soundRef.current) {
    //   soundRef.current = new Audio(base64Data);
    // } else {
    //   soundRef.current.src = base64Data
    // }
    // // var snd = new Audio(base64Data); // "data:audio/wav;base64," + 
    // soundRef.current.play();
    
    // snd.play();

  //   var audioNode = audioContext.createMediaElementSource(snd);

  // // 将音频元素连接到视频流
  //     audioNode.connect(audioContext.destination);

  //     // 播放音符
  //     snd.play();

    // const binaryData = atob(base64Data);
    // const arrayBuffer = new ArrayBuffer(binaryData.length);
    // const view = new Uint8Array(arrayBuffer);
    // for (let i = 0; i < binaryData.length; i++) {
    //   view[i] = binaryData.charCodeAt(i);
    // }
    // const _audioContext = new AudioContext()
    // _audioContext.decodeAudioData(arrayBuffer, (buffer) => {
    //   const source = audioContext.createBufferSource();
    //   source.buffer = buffer;
    //   source.connect(audioContext.destination);
    //   source.start(time * timeRate);
    //   console.log({ time, duration })
    //   source.stop((time + duration) * timeRate);
    // });
  }
  
  function base64ToArrayBuffer(base64) {
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
    setPlay(true)
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
          console.log(bunnyRef.current.children)
        },
        onUpdate() {
          const currentX = Math.floor(bunnyRef.current.x)
          
          const equalZeroSprite = bunnyRef.current.children
            .filter((child: any) => !finishNotes.current.includes(child))
            .filter((child: any) => Math.floor(child.x + currentX) < 0)
          if (equalZeroSprite.length > 0) {
            finishNotes.current = finishNotes.current.concat(equalZeroSprite)
            equalZeroSprite.forEach((sprite: any) => playAudioByNoteText(sprite.alt))
          }
        },
        onComplete() {
          console.log('done')
          media_recorder.current.stop()
        }
      })
    }
  }, [notes])

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

  // C~G A~B
  
  function playMusicEvent () {
    if (chosen.length === 0) return
    const _notes: any = midiTracks.filter((_: any, index: number) => chosen.includes(index)).flatMap((track: any) => {
      // return track.notes
      const _newNotes = track.notes.map((note: any) => ({ ...note, name: note.name, time: note.time }))
      return _newNotes
      // return track.notes.map((note: any) => ({ ...note }))
    })

    // const _notes = Object.keys(audioData).filter((name: string) => name.includes('b')).map((name: string) => ({ name, time: 5 }))
    
    if (_notes.length === 0) return

    // console.log({ _notes })
    const _noteList = _notes.slice(0, 550)
    setNotes(_noteList)
    // startTime()
    // playMusicBox(_noteList)
    recordEvent()
  }

  function startTime () {
    if (process.current.interval) {
      clearInterval(process.current.interval)
    }
    
    process.current.interval = setInterval(() => {
      process.current.time += 0.5
      // setCurrentTime(Math.floor(process.current.time))
      bunnyRef.current.x += 1
    }, 500)
  }

  function recordEvent () {

    var chunks = [];
    // Add audio track
    var stream = stageRef.current._canvas.current.captureStream(60); // Capture canvas as a media stream
    // stream.addTrack(audioTrack.current);

    

    function on_media_recorder_stop (chunks) {
      // Gather chunks of video data into a blob and create an object URL
      var blob = new Blob(chunks, {type: "video/webm" });
      const recording_url = URL.createObjectURL(blob);
      // Attach the object URL to an <a> element, setting the download file name
      const a = document.createElement('a');
      a.style = "display: none;";
      a.href = recording_url;
      a.download = "video.webm";
      document.body.appendChild(a);
      // Trigger the file download
      a.click();
      setTimeout(() => {
        // Clean up - see https://stackoverflow.com/a/48968694 for why it is in a timeout
        URL.revokeObjectURL(recording_url);
        document.body.removeChild(a);
      }, 0);

    }
  }


  useEffect(() => {
    const idx: number = 2
    setMusicMidi(musics[idx])
    readMidiFile(musics[idx])
    // chosenNewTrack(0)
    // chosenNewTrack()
  }, [])

  // const filterdNotes: string[] = noteList
  //   .filter((noteName: string) => true || noteNameGroup.hasOwnProperty(noteName))
  // console.log({ noteNameGroup, noteList })

  const heightLength: number = Object.entries(noteNameGroup).filter(([_, notes]: any) => notes.length > 0).length

  return <>
  MUSIC
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

  <div onClick={playMusicEvent} className="bg-blue-800 text-white cursor-pointer p-2 rounded inline-block mt-2">START</div>
  {/* <div>{ noteList.length }</div> */}

  <div className="mt-2 p-3 flex">
    
    {/* <div className="titles">
      {filterdNotes.map((note: string) => <div className="text-xs h-4 text-center border-t-0 first:border-t-[1px] border min-w-[30px]">{note}</div>)}
    </div> */}
    <div className="flex-1 relative">
      
  <Stage ref={stageRef} options={{height: heightLength * 20, width: 800, background: '#aaa' }}>

    <Sprite width={5} height={heightLength * 20} texture={Texture.WHITE} tint="0x000000" x={0} y={0} />

      <Container ref={bunnyRef}>
        {
          ...Object.entries(noteNameGroup).filter(([_, notes]: any) => notes.length > 0).map(([key, notes]: any, notesIndex: number): any => {
            return notes.map((note: any, noteIndex: number) => {
              return <Sprite eventMode="dynamic" onclick={() => {playAudioByNoteText(key)}} alt={key} key={key + '-' + notesIndex + '-' + noteIndex} width={20} height={20} texture={Texture.WHITE} tint="0x000000" x={note.time * 60} y={(notesIndex) * 20} zIndex={noteIndex}>  
                <Text x={1} y={3}  style={{ fill: '#ffffff', fontSize: 8, align: 'center' }} text={key} />
              </Sprite>
            })
            // return <Sprite key={key + notesIndex} width={20} height={20} texture={Texture.WHITE} tint="0x000000" x={0} y={notesIndex * 20} zIndex={notesIndex} />  
          })
        }
      </Container>
    </Stage>
    <video ref={videoRef} />
    </div>

  </div>


  </>
}