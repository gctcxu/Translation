import { getExcel, exportJS } from './util.js';

const headers = ['zh-cn', 'es-ar']; // 欄位順序需與excel對應欄位順序相同

exportJS(getExcel(), headers)
