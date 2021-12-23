import { readdir } from 'fs/promises';
import exportExcel from './util.js';
import dayjs from 'dayjs';

const localeMap = [];

const files = await readdir("./locales")
const headers = {key:'key', 'zh-cn.js':'中文', 'vi-vn.js':'越南'}

const getLocaleModule = async(path) => {
	return await import(path)
}

await Promise.all(files.map(async(e) => {
	const module = await getLocaleModule(`./locales/${e}`)
	const file = await module.default

	Object.keys(file).forEach(key => {
		let translateItem = localeMap.find(e => e.key===key)

		if(translateItem){
			translateItem[e]=file[key]
		}else{
			translateItem = {key}
			translateItem[e] = file[key]
			localeMap.push(translateItem)
		}
	})
}));

localeMap.forEach(obj => {
	files.forEach(key => {
		if(!obj[key]){
			obj[key]=''
		}
	})
})

await exportExcel(`翻譯${dayjs().format('YYYYMMDD')}`, headers, localeMap)
