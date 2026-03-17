const API_KEY = "35fa1135e4537fe8cfb15fc69f95064e"

const users = [
"rkivedisc",
"proudhsk"
]

const artist = "BTS"
const album = "Map of the Soul: 7"

async function getScrobbles(user){

let url = `https://ws.audioscrobbler.com/2.0/?method=user.gettopalbums&user=rkivedisc&api_key=${API_KEY}&format=json`

let res = await fetch(url)
let data = await res.json()

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

for(let user of users){

let count = await getScrobbles(user)

results.push({
user:user,
plays:count
})

}

results.sort((a,b)=>b.plays-a.plays)

let table = document.getElementById("ranking")

results.forEach((r,i)=>{

table.innerHTML += `
<tr>
<td>${i+1}</td>
<td>${r.user}</td>
<td>${r.plays}</td>
</tr>
`

})

}

buildRanking()
