import { useEffect, useState, useMemo } from "react";
import audioData from '@/lib/box-ogg.js';
import { Midi } from '@tonejs/midi'
import _ from 'lodash'
interface NoteData {
  midi: number,
  name: string,
  time: number,
  duration: number
}

export default () => {

  // Object.keys(audioData).reduce((sum: any, key: string) => ({...sum, [key]: new AudioContext()}), {})
  const noteList: string[] = Object.keys(audioData).map((key: string) => key)
  const musics: string[] = DATA_DIRECTORY
  
  const audioContext = new AudioContext();
  const [chosen, setChosen] = useState<number[]>([])
  const [midiTracks, setTracks] = useState<any>([])
  const [notes, setNotes] = useState<any>([])
  const [musicMidi, setMusicMidi] = useState<string>('')
  // const [page, setPage] = useState<number>(1)
  const timeRate: number = 1
  const noteNameGroup = useMemo(() => notes.length > 0 ? _.groupBy(notes, 'name') : {}, [notes])
  const noteTimes = useMemo(() => notes.length > 0 ? _.uniq(_.map(notes, 'time')) : [], [notes])
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
  async function playMusicBox(notes: NoteData[]) {
    let idx = 0;

    notes.forEach((note: any, index: number) => {
      if (audioData.hasOwnProperty(note.name)) {
        // const { duration } = index > 0 ? notes[index - 1] : { duration: 0 }
        const duration = index > 0 ? 0.5 : 0;
        playAudio(note.name, audioData[note.name].split(',')[1], note.time + ( duration ), note.duration)
        idx ++;
      }
    })
  }

  function playAudio(note: string, base64Data: any, time: number, duration: number) {
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
      source.stop((time + 5) * timeRate);
    });
  }

  
  async function readMidiFile(name: string) {
    const { tracks } = await Midi.fromUrl(`/public/music/midi/${name}.mid`)
    setTracks(tracks.filter((track: any) => track.notes.length > 0))
    setChosen([])
  }

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

  
  function playMusicEvent () {
    if (chosen.length === 0) return
    const _notes: any = midiTracks.filter((_: any, index: number) => chosen.includes(index)).flatMap((track: any) => track.notes)
    if (_notes.length === 0) return
    setNotes(_notes.slice(0, 20))

    // console.log(_notes)
    // console.log(_.groupBy(_notes, 'name'))
    // playMusicBox(_notes)
  }

  useEffect(() => {
    const idx: number = 2
    setMusicMidi(musics[idx])
    readMidiFile(musics[idx])

  }, [])

  const filterdNotes: string[] = noteList
    .filter((noteName: string) => noteNameGroup.hasOwnProperty(noteName))

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
    
    <div className="titles">
      {filterdNotes.map((note: string) => <div className="text-xs h-4 text-center border-t-0 first:border-t-[1px] border border-r-0 min-w-[30px]">{note}</div>)}
    </div>
    <div>

      {
        filterdNotes
          .map((noteName: string) => <div className="text-xs border border-t-0 first:border-t-[1px] flex items-center">
          {
              <span className="border-r-[1px] min-w-[30px] text-center">
              { noteName }
            </span>
            }
          <div className="flex-1 relative h-4 overflow-x-auto">
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

  </div>


  </>
}