export default async function exportExcel (name, header, data) {
  const module = await import('xlsx')

  const XLSX = module.default

  const headerKey = Object.keys(header)
  const ws = XLSX.utils.json_to_sheet([header, ...data], { header: headerKey, skipHeader: true })

  var wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, name)

  XLSX.writeFile(wb, `./output/${name}.xlsx`)
}