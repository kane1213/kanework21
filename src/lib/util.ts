// import { BrowserRouter } from 'react-router-dom';

// export const push = (path: string) => {
//   BrowserRouter.navigate(path);
// }

const defaultKeys = [
  'C',
  'Cb',
  'C#',
  'D',
  'Db',
  'D#',
  'E',
  'F',
  'Fb',
  'F#',
  'G',
  'Gb',
  'G#',
  'A',
  'Ab',
  'A#',
  'B',
].filter((k: string) => !k.includes('b'))
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

export const kNotes: string[] = Object.entries(keyboards).reduce(
  (sum: any, kbs: any) => sum.concat(kbs[1].map((k: string) => k + kbs[0])),
  []
)
