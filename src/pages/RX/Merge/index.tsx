import { useEffect, useState } from 'react';
import { merge, interval } from 'rxjs';
import { take, map } from 'rxjs/operators';

export default () => {
  const [value, setValue] = useState<number|string>(0)

  function numberToLowerCaseLetter(number: number) {
    if (number >= 1 && number <= 26) {
      // 將數字轉換成相應的小寫字母
      return String.fromCharCode(number + 96);
    } else {
      // 超出範圍返回空字串或錯誤訊息
      return '';
    }
  }

  useEffect(() => {
    const numbersObservable = interval(1000).pipe(
      take(10),
      map((_: number, index: number) => index + 1)
    )
    const lettersObservable = interval(2000).pipe(
      take(26),
      map((_: number, index: number) => numberToLowerCaseLetter(index + 1))
    )

    const mergedObservable = merge(numbersObservable, lettersObservable)

    // const timerObservable = interval(1000).pipe(
    //   take(10),
    //   map(value => value + 1),
    //   filter(value => value % 2 === 0)
    // )
    
    mergedObservable.subscribe(
      (value: number|string) => { 
        console.log(value)
        setValue(value)
      },
      error => { console.log(error)},
      () => { 
        console.log('complete')
      }
    )

  }, [])


  return <div className="text-center py-10">{ value }</div>
}