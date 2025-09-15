export function csvEscape(val){
  if (val == null) return ''
  const s = String(val)
  return /[,"\n]/.test(s) ? '"' + s.replace(/"/g,'""') + '"' : s
}
export function downloadCSV(filename, rows){
  const header = Object.keys(rows[0] || {})
  const lines = [ header.map(csvEscape).join(',') ]
  for (const r of rows){
    lines.push(header.map(h => csvEscape(r[h])).join(','))
  }
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}
