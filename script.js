const API_KEY = "35fa1135e4537fe8cfb15fc69f95064e"

const users = [
{ user: "rkivedisc", name: "Ravi" },
{ user: "ikoodle", name: "Babu" },
{ user: "lunacerq", name: "Lua" },
{ user: "whybrubiss", name: "Bru" },
{ user: "antfrpjm", name: "Bryce" }
]

const artist = "BTS"
const album = "Arirang"


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


async function getScrobbles(user){

let url = `https://ws.audioscrobbler.com/2.0/?method=user.gettopalbums&user=${user}&api_key=${API_KEY}&format=json&limit=1000`

let res = await fetch(url)
let data = await res.json()

if(!data.topalbums) return 0

let albums = data.topalbums.album

for(let a of albums){

if(
a.name.toLowerCase() === album.toLowerCase() &&
a.artist.name.toLowerCase() === artist.toLowerCase()
){
return parseInt(a.playcount)
}

}

return 0
}


async function buildRanking(){

let results = []

for(let u of users){

let count = await getScrobbles(u.user)

results.push({
name: u.name,
plays: count
})

}

results.sort((a,b)=>b.plays-a.plays)

let table = document.getElementById("ranking")

table.innerHTML = ""

results.forEach((r,i)=>{

let medal=""

if(i===0) medal="🥇"
if(i===1) medal="🥈"
if(i===2) medal="🥉"

table.innerHTML += `
<tr>
<td class="medal">${medal || (i+1)}</td>
<td>${r.name}</td>
<td>${r.plays}</td>
</tr>
`

})

}


loadAlbumCover()
buildRanking()
