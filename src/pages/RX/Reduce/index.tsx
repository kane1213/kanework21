import { useEffect, useState } from 'react';
import { of } from 'rxjs';
import { reduce, map, filter } from 'rxjs/operators';

export default () => {
  const [num, setNum] = useState<number>(0)
  useEffect(() => {
    const numbersObservable = of(...new Array(10).fill(1).map((v:number, i: number) => v + i))
      .pipe(
        filter((value: number) => value % 2 === 0),
        map((value: number) => Math.pow(value, 2)),
        reduce((acc: number, value: number) => acc + value , 0)
      )
    // const lettersObservable = of(4, 5, 6);
    // const updateObservable = interval(1000).pipe(
    //   take(10),
    //   map(value => value)
    // )

    // const mergedObservable = merge(numbersObservable, lettersObservable).pipe(
    //   concat(updateObservable)
    // )

    // const timerObservable = interval(1000).pipe(
    //   take(10),
    //   map(value => value + 1),
    //   filter(value => value % 2 === 0)
    // )
    
    numbersObservable.subscribe(
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