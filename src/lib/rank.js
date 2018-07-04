import * as Storage from "./storage";
const RankKey = "_rankList_"

// 通过id获取该扩展的rank值
function get(id, storage) {
  var rankObj = storage[RankKey]
  var rank = 0;
  if(rankObj && rankObj[id]){
    rank = parseInt(rankObj[id]);
  }
  return rank;
}

// 设置Rank
function set(id) {
  Storage.getAll().then(storage => {
    var rankObj = Storage.get(RankKey) || {}
    if (rankObj[id]) {
      rankObj[id] = parseInt(rankObj[id]) + 1
    } else {
      rankObj[id] = 1
    }
    Storage.set(RankKey, rankObj)
  })
}

export  { get, set }