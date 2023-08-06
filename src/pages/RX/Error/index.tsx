import { useEffect, useState } from 'react';
import { of, throwError, merge } from 'rxjs';
import { catchError } from 'rxjs/operators';



export default () => {
  const [num, setNum] = useState<number| string>(0)
  useEffect(() => {
    
    // 創建一個 Observable，這裡使用 of 創建了一些數字
    const numbersObservable = of(1, 2, 3, 4, 5);

    // 使用 throwError 創建一個立即抛出錯誤的 Observable
    const errorObservable = throwError('發生了一個錯誤');

    // 合併 numbersObservable 和 errorObservable
    const mergedObservable = merge(
      numbersObservable,
      errorObservable
    ).pipe(
      catchError(error => {
        console.error('錯誤訊息：', error);
        return of('這是預設值');
      })
    );

    // 訂閱 mergedObservable
    mergedObservable.subscribe(
      value => {
        setNum(value)
        console.log('處理後的值：', value)
      },
      error => {
        setNum(error)
        console.error('錯誤處理後：', error)
      },
      () => console.log('Observable 結束')
    );

  }, [])


  return <div className="text-center py-10">{ num }</div>
}