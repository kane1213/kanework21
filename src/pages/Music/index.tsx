import { useEffect, useState, useMemo, useRef, createRef } from "react";
import { Sprite, Stage, Container } from "react-pixi-fiber";
import audioData from '@/lib/box-ogg.js';
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
  
  const audioContext = new AudioContext();
  const [chosen, setChosen] = useState<number[]>([])
  const [midiTracks, setTracks] = useState<any>([])
  const [notes, setNotes] = useState<any>([])
  const [musicMidi, setMusicMidi] = useState<string>('')
  const [play, setPlay] = useState<boolean>(false)
  // const [page, setPage] = useState<number>(1)
  const timeRate: number = 1
  const step = useRef<number>(0)


  
  const noteTimes = useMemo(() => notes.length > 0 ? _.uniq(_.map(notes, 'time')) : [], [notes])
  const defaultKeys = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
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
    const useNumber: number[] = _.uniq(Object.keys(groupNotes).map((key: string) => parseInt(key[1])))
    return useNumber.reduce((sum: any, num: number) => {
      console.log({num})
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
    
    playAudio(audioData[text].split(',')[1], 0, 10)
  }

  function playAudio(base64Data: any, time: number, duration: number) {
    const binaryData = atob(base64Data);
    const arrayBuffer = new ArrayBuffer(binaryData.length);
    const view = new Uint8Array(arrayBuffer);
    for (let i = 0; i < binaryData.length; i++) {
      view[i] = binaryData.charCodeAt(i);
    }
    audioContext.decodeAudioData(arrayBuffer, (buffer) => {
      const source = audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContext.destination);
      source.start(time * timeRate);
      source.stop((time + duration) * timeRate);
    });
  }

  
  async function readMidiFile(name: string) {
    const { tracks } = await Midi.fromUrl(`/public/music/midi/${name}.mid`)
    const _tracks = tracks.filter((track: any) => track.notes.length > 0)
    setTracks(_tracks)
    setChosen([0])
    setPlay(true)
  }

  useEffect(() => {
    if (notes.length > 0) {
      bunnyRef.current.x = 10
      gsap.to(bunnyRef.current, {
        x: -bunnyRef.current.width,
        duration: 10,
        ease: "none",
        onUpdate() {
          const currentX = Math.floor(bunnyRef.current.x)
          const equalZeroSprite = bunnyRef.current.children.filter((child: any) => (child.x + currentX) === 0)
          if (equalZeroSprite.length > 0) {
            equalZeroSprite.forEach((sprite: any) => playAudioByNoteText(sprite.alt))
          }
        },
        onComplete() {
          console.log('done')
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
      const _newNotes = track.notes.map((note: any) => ({ ...note, name: note.name.replace('#', 'b'), time: note.time }))
      return _newNotes
      // return track.notes.map((note: any) => ({ ...note }))
    })
    if (_notes.length === 0) return
    const _noteList = _notes.slice(0, 550)
    setNotes(_noteList)
    // startTime()
    // playMusicBox(_noteList)
    
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


  useEffect(() => {
    const idx: number = 0
    setMusicMidi(musics[idx])
    readMidiFile(musics[idx])
    // chosenNewTrack(0)
    // chosenNewTrack()
  }, [])

  const filterdNotes: string[] = noteList
    .filter((noteName: string) => true || noteNameGroup.hasOwnProperty(noteName))
  // console.log({ noteNameGroup, noteList })

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
      
      {/* <div>
        {
          filterdNotes
            .map((noteName: string) => <div className="text-xs border border-t-0 first:border-t-[1px] flex items-center  h-4">
            <div className="flex-1 relative h-4">
              <div className={`w-[${noteTimeRange.max * 100}px]`}>
                { 
                  noteNameGroup.hasOwnProperty(noteName) && 
                    noteNameGroup[noteName].map((note: any) => 
                      <div className="absolute top-0 bg-gray-600 shadow-inner w-4 h-4" style={{ left: Math.floor(note.time / gap * 32)  }} key={noteName + note.time} />
                      )
                }
              </div>
            </div>
          
        </div>)
        }
      </div>
      <div style={{ transform: `translateX(${currentTime * 16}px)` }} className="w-0.5 h-full bg-black absolute top-0 transition-transform ease-linear duration-1000" /> */}

  {
    Object.keys(noteNameGroup).map((key: string) => <div>{ key }</div>)
  }

  <Stage ref={stageRef} options={{height: 600, width: 800, background: '#aaa' }}>

    <Sprite width={5} height={600} texture={Texture.WHITE} tint="0x000000" x={0} y={0} />

      <Container ref={bunnyRef}>
        {
          ...Object.entries(noteNameGroup).map(([key, notes]: any, notesIndex: number): any => {
            return notes.map((note: any, noteIndex: number) => {
              return <Sprite alt={key} key={key + '-' + notesIndex + '-' + noteIndex} width={20} height={20} texture={Texture.WHITE} tint="0x000000" x={note.time * 40} y={(notesIndex) * 20} zIndex={noteIndex} />  
            })
            // return <Sprite key={key + notesIndex} width={20} height={20} texture={Texture.WHITE} tint="0x000000" x={0} y={notesIndex * 20} zIndex={notesIndex} />  
          })
        }
      </Container>
    </Stage>

    </div>

  </div>


  </>
}