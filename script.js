const API_KEY = "35fa1135e4537fe8cfb15fc69f95064e"

const users = [
{ user: "rkivedisc", name: "ravico" },
{ user: "ikoodle", name: "min" },
{ user: "closrjm", name: "lua" },
{ user: "whybrubiss", name: "bru" },
{ user: "antfrpjm", name: "bryce" },
{ user: "ittsope", name: "sassá"},
{ user: "rkimv", name: "senju"},
{ user: "calicakitty", name: "cacau"},
{ user: "yoonismo", name: "nabi"},
]

const artist = "BTS"
const album = "Arirang"

let globalResults = []
let currentMode = "total"

// ALBUM
async function loadAlbumCover(){
let url = `https://ws.audioscrobbler.com/2.0/?method=album.getinfo&api_key=${API_KEY}&artist=${encodeURIComponent(artist)}&album=${encodeURIComponent(album)}&format=json`
let res = await fetch(url)
let data = await res.json()
let cover = data.album.image.pop()["#text"]

document.getElementById("album-card").innerHTML = `
<img class="album-cover" src="${cover}">
<div class="album-title">${album}</div>
<div class="album-artist">${artist}</div>
`
}

// AVATAR
async function getUserAvatar(user){
let url = `https://ws.audioscrobbler.com/2.0/?method=user.getinfo&user=${user}&api_key=${API_KEY}&format=json`
let res = await fetch(url)
let data = await res.json()

if(!data.user) return ""

let img = data.user.image
return img[img.length-1]["#text"] || ""
}

// TOTAL
async function getScrobbles(user){
let url = `https://ws.audioscrobbler.com/2.0/?method=user.gettopalbums&user=${user}&api_key=${API_KEY}&format=json&limit=1000`
let res = await fetch(url)
let data = await res.json()

if(!data.topalbums) return 0

for(let a of data.topalbums.album){
if(
a.name.toLowerCase() === album.toLowerCase() &&
a.artist.name.toLowerCase() === artist.toLowerCase()
){
return parseInt(a.playcount)
}
}
return 0
}

// PERIODOS
async function getScrobblesByPeriod(user){

let now = Math.floor(Date.now()/1000)
let oneDayAgo = now - 86400
let oneWeekAgo = now - 604800

let page = 1
let daily = 0
let weekly = 0

while(true){

let url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${user}&api_key=${API_KEY}&format=json&limit=200&page=${page}`
let res = await fetch(url)
let data = await res.json()

if(!data.recenttracks) break

let tracks = data.recenttracks.track
if(!tracks.length) break

let stop = false

for(let t of tracks){

if(!t.date) continue

let ts = parseInt(t.date.uts)

if(ts < oneWeekAgo){
stop = true
break
}

if(
t.album["#text"].toLowerCase() === album.toLowerCase() &&
t.artist["#text"].toLowerCase() === artist.toLowerCase()
){
if(ts >= oneDayAgo) daily++
if(ts >= oneWeekAgo) weekly++
}
}

if(stop) break
page++
}

return { daily, weekly }
}

// BUILD
async function buildRanking(){

document.getElementById("loader").style.display = "table-row-group"

let total = 0
globalResults = []

for(let u of users){

let totalCount = await getScrobbles(u.user)
let period = await getScrobblesByPeriod(u.user)
let avatar = await getUserAvatar(u.user)

globalResults.push({
name: u.name,
avatar: avatar,
total: totalCount,
daily: period.daily,
weekly: period.weekly
})

total += totalCount
}

document.getElementById("total-scrobbles").innerHTML =
`<strong>Total de scrobbles do grupo</strong><br>${total.toLocaleString()}`

renderTable()

document.getElementById("loader").style.display = "none"
}

// RENDER
function renderTable(){

let table = document.getElementById("ranking")

table.style.opacity = 0
table.style.transform = "translateY(5px)"

setTimeout(()=>{

table.innerHTML = ""

let sorted = [...globalResults].sort((a,b)=>b[currentMode]-a[currentMode])

sorted.forEach((r,i)=>{

let medal=""
if(i===0) medal="🥇"
if(i===1) medal="🥈"
if(i===2) medal="🥉"

table.innerHTML += `
<tr>
<td>${medal || (i+1)}</td>
<td class="user-cell">
<img class="avatar" src="${r.avatar}">
${r.name}
</td>
<td>${r[currentMode].toLocaleString()}</td>
</tr>
`
})

table.style.opacity = 1
table.style.transform = "translateY(0)"

},150)
}

// TABS
document.querySelectorAll(".tab").forEach(btn=>{
btn.addEventListener("click", ()=>{

document.querySelectorAll(".tab").forEach(b=>b.classList.remove("active"))
btn.classList.add("active")

currentMode = btn.dataset.mode
renderTable()

})
})

// INIT
loadAlbumCover()
buildRanking()
