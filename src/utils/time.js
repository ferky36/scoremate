export const pad = n => String(n).padStart(2, '0')
export const toHM = date => `${pad(date.getHours())}:${pad(date.getMinutes())}`
export const fmtMMSS = (sec) => {
  const m = Math.floor(sec/60), s = Math.floor(sec%60)
  return `${pad(m)}:${pad(s)}`
}
