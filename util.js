import { writeFile } from 'fs/promises';
const module = await import('xlsx');
const XLSX = module.default;
/**
 * 將excel的資料分類，key的歸為一類，英文歸為一類，中文歸為一類...以此類推
 * @param {Object} content 
 * @param {Object} colList 
 * @returns 過濾後的資料
 */
const filterExcelContent = (content) => {
  let headerList = [];
  const filterData = {};
  const excelKeys = Object.keys(content).filter((e) => e[0] !== '!');
  excelKeys.forEach((e) => {
    // 如 A11 中的 A
    const col = e.substring(0, 1);
    // 如 A11 中的 11
    const row = parseInt(e.substring(1));
    // 當前單元格的值
    const value = content[e].v;

    if (row === 1) {
      headerList.push({col,row,value});
      filterData[`${col}`] = [];
    } else {
      filterData[`${col}`].push({col,row,value});
    }
    
  });
  // console.log(headerList);
  // console.log(filterData);
  return { filterData, headerList };
};
/**
 * 將分類過的資料進行資料重構
 * @param {*} data 
 */
const dataRestructure = (data) => {
  const keyList = Object.keys(data);
  const keyListPopFirst = JSON.parse(JSON.stringify(keyList)); // 移除key代表符號
  keyListPopFirst.shift();

  const finalDataList = {};
  keyListPopFirst.forEach((e) => {
    finalDataList[e] = {};
  });

  /**
   * 將物件資料進行重構並依照對應的語言加上語言值
   * @param {*} layerArray 每行key值切割後的字串(by reference)
   * @param {*} startIndex layerArray的index從哪開始
   * @param {*} checkData 重構的物件位置(by reference)
   * @param {*} languageValue 若startIndex為最後一個時，代表需要將語言值填入
   */
  const addDataValueAndRestructure = (layerArray, startIndex, checkData, languageValue) => {
    layerArray.forEach((layer,index) => {
      if (index === startIndex) {
        if (layerArray.length - 1 === index) {
          checkData[layer] = languageValue;
        } else {
          if (checkData.hasOwnProperty(layer)) {
            addDataValueAndRestructure(layerArray, index + 1, checkData[layer], languageValue)
          } else {
            checkData[layer] = {};
            addDataValueAndRestructure(layerArray, index + 1, checkData[layer], languageValue)
          }
        }

      }
    });
  };
  // 取 key的陣列進行迭代
  Object.keys(finalDataList).forEach((index) => {

    data[keyList[0]].forEach((e) => {
      const layerArray = e.value.split('.');

      const languageValueData = {};
      Object.keys(e).forEach((sign) => {
        if(keyListPopFirst.includes(sign)) languageValueData[sign] = e[sign];
      });
      addDataValueAndRestructure(layerArray, 0, finalDataList[index], languageValueData[index]);
    });
  });
  // console.log('---------------------------------------------------------------');
  // console.log(JSON.stringify(finalDataList));
  return { finalDataList };
};

const addValue2KeyArray = (data) => {
  const keyList = Object.keys(data);

  data[keyList[0]].forEach((e, index) => {
    keyList.forEach((key,i) => {
      if (i !== 0) {
        e[key] = data[key][index].value;
      }
    });
  });
};

export function getExcel() {
  const workbook = XLSX.readFile('./excel/excel.xlsx'); // 取得 excel本人

  const sheetNames = workbook.SheetNames; // 取得 excel 所有的工作表名(以陣列儲存)

  const excelContent = workbook.Sheets[sheetNames[0]]; // 取得第一個工作表的內容

  const {filterData, headerList} = filterExcelContent(excelContent); // 將excel的資料進行分類

  addValue2KeyArray(filterData); // 將其餘語言的value加入到key陣列中

  const { finalDataList } = dataRestructure(filterData);

  return finalDataList;
};


export function exportJS(finalDataList, headers) {
  const writeFileCallback = (err) => {
    if (err) throw err;
    else {
      console.log('done');
    }
  };

  Object.keys(finalDataList).forEach((language,index) => {
    writeFile(`./output/${headers[index]}.json`,JSON.stringify(finalDataList[language], null , 4),writeFileCallback);
  });
}
