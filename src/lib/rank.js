const RankKey = "_rankList_"

// 通过id获取该扩展的rank值
function get(res, id) {
  var obj = res[RankKey]
  var rank = 0;
  if(obj && obj[id]){
    rank = parseInt(obj[id]);
  }
  return rank;
}

// 设置Rank
function set(res, id) {
  var obj = res[RankKey] || {}
  if (obj[id]) {
    obj[id] = parseInt(obj[id]) + 1
  } else {
    obj[id] = 1
  }
  res[RankKey] = obj
}

export  { get, set }