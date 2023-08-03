import { useEffect, useState } from 'react';
import { merge, of, interval } from 'rxjs';
import { concat, take, map } from 'rxjs/operators';

export default () => {
  const [num, setNum] = useState<number>(0)
  useEffect(() => {
    const numbersObservable = of(1, 2, 3);
    const lettersObservable = of(4, 5, 6);
    const updateObservable = interval(1000).pipe(
      take(10),
      map(value => value)
    )

    const mergedObservable = merge(numbersObservable, lettersObservable).pipe(
      concat(updateObservable)
    )

    // const timerObservable = interval(1000).pipe(
    //   take(10),
    //   map(value => value + 1),
    //   filter(value => value % 2 === 0)
    // )
    
    mergedObservable.subscribe(
      (value: number) => { 
        console.log(value)
        setNum(value)
      },
      error => { console.log(error)},
      () => { 
        console.log('complete')
      }
    )

  }, [])


  return <div className="text-center py-10">{ num }</div>
}