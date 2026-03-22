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

// ----------------------
// ALBUM COVER
// ----------------------
async function loadAlbumCover(){

let url = `https://ws.audioscrobbler.com/2.0/?method=album.getinfo&api_key=${API_KEY}&artist=${encodeURIComponent(artist)}&album=${encodeURIComponent(album)}&format=json`

let res = await fetch(url)
let data = await res.json()

let cover = data.album?.image?.pop()?.["#text"] || ""

document.getElementById("album-card").innerHTML = `
<img class="album-cover" src="${cover}">
<div class="album-title">${album}</div>
<div class="album-artist">${artist}</div>
`

}

// ----------------------
// TOTAL (histórico)
// ----------------------
async function getScrobbles(user){

try{

let url = `/api?method=user.gettopalbums&user=${user}&api_key=${API_KEY}&format=json&limit=1000`

let res = await fetch(url)
if(!res.ok) return 0

let data = await res.json()

if(!data.topalbums) return 0

let albums = data.topalbums.album || []

for(let a of albums){

if(
a.name?.toLowerCase() === album.toLowerCase() &&
a.artist?.name?.toLowerCase() === artist.toLowerCase()
){
return parseInt(a.playcount) || 0
}

}

return 0

}catch{
return 0
}

}

// ----------------------
// DIÁRIO + SEMANAL
// ----------------------
async function getScrobblesByPeriod(user){

let now = Math.floor(Date.now() / 1000)
let oneDayAgo = now - 86400
let oneWeekAgo = now - 604800

let page = 1
let daily = 0
let weekly = 0

while(true){

try{

let url = `/api?method=user.getrecenttracks&user=${user}&api_key=${API_KEY}&format=json&limit=200&page=${page}`

let res = await fetch(url)
if(!res.ok) break

let data = await res.json()

if(!data.recenttracks) break

let tracks = data.recenttracks.track || []
if(!Array.isArray(tracks)) tracks = [tracks]

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
t.album &&
t.artist &&
t.album["#text"] &&
t.artist["#text"] &&
t.album["#text"].toLowerCase() === album.toLowerCase() &&
t.artist["#text"].toLowerCase() === artist.toLowerCase()
){

if(ts >= oneDayAgo) daily++
if(ts >= oneWeekAgo) weekly++

}

}

if(stop) break
page++

}catch{
break
}

}

return { daily, weekly }

}

// ----------------------
// BUILD RANKING
// ----------------------
async function buildRanking(){

globalResults = []

let total = 0

for(let u of users){

let totalCount = await getScrobbles(u.user)
let period = await getScrobblesByPeriod(u.user)

globalResults.push({
name: u.name,
total: totalCount,
daily: period.daily,
weekly: period.weekly
})

total += totalCount
}

document.getElementById("total-scrobbles").innerHTML =
`<strong>Total de scrobbles do grupo: </strong>${total.toLocaleString()}`

renderTable("total")

}

// ----------------------
// RENDER
// ----------------------
function renderTable(mode = "total"){

let table = document.getElementById("ranking")
table.innerHTML = ""

let sorted = [...globalResults].sort((a,b)=>b[mode]-a[mode])

sorted.forEach((r,i)=>{

let medal=""
if(i===0) medal="🥇"
if(i===1) medal="🥈"
if(i===2) medal="🥉"

table.innerHTML += `
<tr>
<td class="medal">${medal || (i+1)}</td>
<td>${r.name}</td>
<td>${r[mode].toLocaleString()}</td>
</tr>
`

})

}

// ----------------------
// EVENTO ABAS
// ----------------------
document.querySelectorAll(".tab").forEach(tab=>{
tab.addEventListener("click", ()=>{

document.querySelectorAll(".tab").forEach(t=>t.classList.remove("active"))
tab.classList.add("active")

let mode = tab.dataset.mode
renderTable(mode)

})
})

// ----------------------
loadAlbumCover()
buildRanking()
