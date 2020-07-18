const fetch = require('node-fetch');
const fs = require('fs');

const btvIds = ['9072112', '18074328', '86082509', '104246535', '35626552'];
const ffzIdsIds = ['bluksy', 'itsveryscary', 'a_seagull'];
let imgList = {};

(async () => {
    const btvUrls = await getBtvUrls(btvIds);
    const ffzUrls = await getFfzUrls(ffzIdsIds);
    const twitchUrls = await getTwitchUrls();
    const emotes = Object.assign({}, twitchUrls, btvUrls, ffzUrls);

    for (const emoteName in emotes){
        console.log(`Encoding emote ${emoteName}`);
        const imgRes = await fetch(emotes[emoteName]);
        const imgBuff = await imgRes.arrayBuffer();

        imgList[emoteName] = `data:${imgRes.headers.get('content-type')};base64,${Buffer.from(imgBuff).toString('base64')}`;
    }

    console.log('Processing done');
    fs.writeFileSync('emotes.json', JSON.stringify(imgList));
})();

async function getBtvUrls(ids) {
    const map = {};
    for (const id of ids) {
        const res = await fetch(`https://api.betterttv.net/3/cached/users/twitch/${id}`);
        const json = await res.json();

        for (const emote of json.channelEmotes.concat(json.sharedEmotes)){
            map[emote.code] = `https://cdn.betterttv.net/emote/${emote.id}/1x`;
        }
    }
    return map;
}

async function getFfzUrls(ids) {
    const map = {};
    for (const id of ids) {
        const res = await fetch(`https://api.frankerfacez.com/v1/room/${id}`);
        const json = await res.json();

        for (const emote of json.sets[Object.keys(json.sets)[0]].emoticons) {
            map[emote.name] = `https:${emote.urls[1]}`;
        }
    }
    return map;
}

async function getTwitchUrls() {
    const map = {};
    const res = await fetch(`https://api.twitchemotes.com/api/v4/channels/0`);
    const json = await res.json();

    for (const emote of json.emotes) {
        map[emote.code] = `https://static-cdn.jtvnw.net/emoticons/v1/${emote.id}/1.0`;
    }
    return map;
}

