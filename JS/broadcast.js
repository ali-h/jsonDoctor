const broadcast = function(data, callback) {
  var empty_ids = []
  for(id in data) {
    if(data[id] == "") {
      empty_ids.push(id)
    }
  }
  var empty_ids_filtered = empty_ids.filter(e => e !== 'private_key')
  if(empty_ids.length > 0 && data.use_keychain == "false") {
    callback(1, "ERR: missing " + empty_ids + ".")
  }
  else if(empty_ids_filtered.length > 0){
    callback(1, "ERR: missing " + empty_ids_filtered + ".")
  }
  else {
    function IsJsonString(str) {
      try {
        JSON.parse(str);
      } catch (e) {
        return false;
      }
      return true;
    }
    if(IsJsonString(data.json)) {
      data.json = JSON.parse(data.json)
      data.json = JSON.stringify(data.json)
    }
    if(data.use_keychain == "true") {
      hive_keychain.requestCustomJson(
        data.username,
        data.json_id,
        data.required_auth_type,
        data.json,
        "Broadcasting through Json Doctor",
        function(response) {
          if(response.success == false) {
            callback(1, response.message.toLowerCase())
          }
          else if(response.success == true) {
            callback(0, {
              msg: "transaction successfull.",
              tx_id: response.result.id,
              block_num: response.result.block_num
            })
          }
        },
        data.rpc_server
      )
    }
    else {
      hive.broadcast.customJson(
        data.private_key,
        (data.required_auth_type == "active") ? [data.username] : [],
        (data.required_auth_type == "posting") ? [data.username] : [],
        data.json_id,
        data.json,
        function(err, result) {
          if(err) {
            callback(1, err.toString())
            return
          }
          callback(0, {
            msg: "transaction successfull.",
            tx_id: result.id,
            block_num: result.block_num
          })
        }
      )
    }
  }
}