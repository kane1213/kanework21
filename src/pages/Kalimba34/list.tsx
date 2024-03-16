import { useState } from "react";
import { Midi } from '@tonejs/midi'
import { useNavigate } from "react-router-dom";


export default () => {
  const router = useNavigate()
  const musics: string[] = DATA_DIRECTORY.filter((name: string) => !name.includes('hide'))
  const [chosen, setChosen] = useState<number[]>([])
  const [midiTracks, setTracks] = useState<any>([])
  const [musicMidi, setMusicMidi] = useState<string>('')
  async function readMidiFile(name: string) {
    const _path = name.includes('.mid')
      ? name
      : `/public/music/midi/${name}.mid`
    const { tracks } = await Midi.fromUrl(_path)
    // const { tracks } = await Midi.fromUrl(name)
    const _tracks = tracks.filter((track: any) => track.notes.length > 0)
    setTracks(_tracks)
    setChosen(Object.keys(_tracks).map((num: string) => parseInt(num)))
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

  function getToMusic () {
    const path = !musicMidi.includes('.mid')
      ? musicMidi
      : musicMidi.split('/').slice(-1)[0].replace('.mid', '')
    router(`/music/${path}/${chosen.join()}`)
  }

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