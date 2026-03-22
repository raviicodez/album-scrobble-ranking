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

// ALBUM (mantido igual)
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

// AVATAR (mantido)
async function getUserAvatar(user){
let url = `https://ws.audioscrobbler.com/2.0/?method=user.getinfo&user=${user}&api_key=${API_KEY}&format=json`
let res = await fetch(url)
let data = await res.json()

if(!data.user) return ""

let img = data.user.image
return img[img.length-1]["#text"] || ""
}

// TOTAL (mantido)
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

// 🧠 NOVO: processamento em lotes (seguro)
async function processInBatches(list, batchSize = 3){

let results = []

for(let i = 0; i < list.length; i += batchSize){

let batch = list.slice(i, i + batchSize)

let batchResults = await Promise.all(
batch.map(async (u)=>{

let totalCount = await getScrobbles(u.user)
let avatar = await getUserAvatar(u.user)

if(!avatar){
avatar = "https://via.placeholder.com/26"
}

return {
name: u.name,
avatar: avatar,
total: totalCount
}

})
)

results.push(...batchResults)
}

return results
}

// BUILD (otimizado sem quebrar)
async function buildRanking(){

document.getElementById("loader").style.display = "table-row-group"

let total = 0

globalResults = await processInBatches(users, 4)

total = globalResults.reduce((sum, u)=> sum + u.total, 0)

document.getElementById("total-scrobbles").innerHTML =
`<strong>Total de scrobbles do grupo</strong><br>${total.toLocaleString()}`

renderTable()

document.getElementById("loader").style.display = "none"
}

// RENDER (igual)
function renderTable(){

let table = document.getElementById("ranking")

table.style.opacity = 0
table.style.transform = "translateY(5px)"

setTimeout(()=>{

table.innerHTML = ""

let sorted = [...globalResults].sort((a,b)=>b.total-a.total)

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
<span>${r.name}</span>
</td>
<td>${r.total.toLocaleString()}</td>
</tr>
`
})

table.style.opacity = 1
table.style.transform = "translateY(0)"

},150)
}

// INIT
loadAlbumCover()
buildRanking()
