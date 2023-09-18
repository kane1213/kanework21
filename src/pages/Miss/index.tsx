// interface GirlData {
//   imgUrl: string;
//   title: string;
// }
import { useState } from 'react';
import storeData from './girlsData';
import classNames  from 'classnames';

export default () => {
  
  const [selected, setSelected] = useState<number>(-1)
  const [sized, setSized] = useState<number>(-1)
  const stores: any = Object.entries(storeData).map(([id, { name }]) => ({ id, name }))
  const [page, setPage] = useState<number>(1)
  const pageSize: number = 8
  // useEffect(() => {
  //   setSized(-1)
  // }, [selected])

  // const newYork: GirlData[] = [{"imgUrl":"https://www.lovespa178.com.tw/upload/20230906130717ilj7y1.jpg","title":"紐約水漾"},{"imgUrl":"https://www.lovespa178.com.tw/upload/202309042040415w1hd1.jpg","title":"紐約秘書"},{"imgUrl":"https://www.lovespa178.com.tw/upload/202308291807545isdh1.jpg","title":"紐約奶昔"},{"imgUrl":"https://www.lovespa178.com.tw/upload/20230819141655tttkk1.jpg","title":"紐約卉卉"},{"imgUrl":"https://www.lovespa178.com.tw/upload/202306162301403ffjm1.jpg","title":"紐約薇琪"},{"imgUrl":"https://www.lovespa178.com.tw/upload/202201261930224ncml1.jpg","title":"紐約丁丁"},{"imgUrl":"https://www.lovespa178.com.tw/upload/2022021205374330h5z1.jpg","title":"紐約芳芳"},{"imgUrl":"https://www.lovespa178.com.tw/upload/20220122015609bg5lv1.jpg","title":"紐約梓梓"},{"imgUrl":"https://www.lovespa178.com.tw/upload/t_20220818161940wzgik1.jpg","title":"*紐約咪路"},{"imgUrl":"https://www.lovespa178.com.tw/upload/t_20230331185336ndb1x1.jpeg","title":"*紐約歡芯"},{"imgUrl":"https://www.lovespa178.com.tw/upload/t_20221204141543gqep11.jpg","title":"紐約馬爾泰"},{"imgUrl":"https://www.lovespa178.com.tw/upload/t_202304142133204cdo31.jpg","title":"紐約幼寧"},{"imgUrl":"https://www.lovespa178.com.tw/upload/t_202307191527587jp5e1.jpg","title":"紐約李璇"},{"imgUrl":"https://www.lovespa178.com.tw/upload/t_20211121181646249sl1.jpg","title":"*紐約JOJO"},{"imgUrl":"https://www.lovespa178.com.tw/upload/t_202209201349055u3o41.jpg","title":"*紐約宣儀"},{"imgUrl":"https://www.lovespa178.com.tw/upload/t_20230721130056srfj21.jpg","title":"紐約舒潔"},{"imgUrl":"https://www.lovespa178.com.tw/upload/2023062218315705fml1.jpg","title":"*紐約晴兒"},{"imgUrl":"https://www.lovespa178.com.tw/upload/202201210212227g86r1.jpg","title":"*紐約卡卡"},{"imgUrl":"https://www.lovespa178.com.tw/upload/20230626035452xmv6f1.jpg","title":"紐約皇后"},{"imgUrl":"https://www.lovespa178.com.tw/upload/20230714163557mty3l1.jpg","title":"紐約波波"},{"imgUrl":"https://www.lovespa178.com.tw/upload/20230802184010q7fay1.jpg","title":"紐約玥玥"},{"imgUrl":"https://www.lovespa178.com.tw/upload/20230302172815xwsjn1.jpg","title":"*紐約春麗"},{"imgUrl":"https://www.lovespa178.com.tw/upload/20230629021257np1dx1.jpg","title":"*紐約彤彤"}]
  // const farm: GirlData[] = [{"imgUrl":"https://www.lovespa178.com.tw/upload/t_20221205153424ilq501.jpg","title":"農安欣欣"},{"imgUrl":"https://www.lovespa178.com.tw/upload/t_20220303040640liv4k1.jpg","title":"農安夢夢"},{"imgUrl":"https://www.lovespa178.com.tw/upload/t_202305191911284bzoa1.jpg","title":"農安香檳"},{"imgUrl":"https://www.lovespa178.com.tw/upload/t_202203020333065p7o11.jpg","title":"農安安娜"},{"imgUrl":"https://www.lovespa178.com.tw/upload/20230109210716mm6nq1.jpg","title":"農安G娜"},{"imgUrl":"https://www.lovespa178.com.tw/upload/202306281318563zz7g1.jpg","title":"農安亮亮"}]

  // const girls = newYork.concat(farm)
  
  return <div className="max-w-[1024px] mx-auto ">
    <div>
      {
        stores.map((store: any) => <button key={store.id} onClick={() => { setSelected(store.id); setSized(-1); setPage(1) }} className={classNames("font-bold","py-0.5","mr-1","mt-1","px-4","rounded", { "hover:bg-blue-700 bg-blue-500 text-white": selected !== store.id }, { "hover:bg-blue-300 bg-blue-100 text-blue-500 border border-blue-500": selected === store.id })}>{store.name}</button>)
      }
    </div>

    {
        selected !== -1 && <>
          <div>
            <hr className="my-2" />
            {
              new Array(3)
                .fill(1)
                .map((v: number, index: number) => v + index)
                .map((value: number) => <button key={value} onClick={() => { setSized(value); setPage(1) }} className={classNames("font-bold","py-0.5","mr-1","mt-1","px-4","rounded", { "hover:bg-blue-700 bg-blue-500 text-white": sized !== value }, { "hover:bg-blue-300 bg-blue-100 text-blue-500 border border-blue-500": sized === value })}>
                  size{value}[{ storeData[selected]['girls'][`size${value}`].length }]
                </button>)
            }  
          </div>
        </>
      }
      {
      selected !== -1 && sized !== -1 && <div>
        <button className="border" onClick={() => { if (page > 1) setPage(page - 1) } }>BACK</button>
        <button className="border" onClick={() => { setPage(page + 1) } }>NEXT</button>
      </div>
    }
    
    <div className="grid grid-cols-4 gap-3 mt-4">
      {
        selected !== -1 && sized !== -1 && storeData.hasOwnProperty(selected) &&
          storeData[selected]['girls'][`size${sized}`].slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize).map((girl: any) => <div className="border p-1 rounded" key={selected + '_' + sized + '_' + girl.title}>
            <div className="text-center bg-black text-white">{ girl.title }</div>
            <img src={girl.imgUrl} />
          </div>)
      }

    </div>
    
  </div>
  
}