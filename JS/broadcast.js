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
          console.log(response)
          if(response.success == false) {
            callback(1, "ERR: " + response.message.toLowerCase())
          }
          else if(response.success == true) {
            callback(0, {
              msg: "transaction successfull.",
              tx_id: response.result.id
            })
          }
        },
        data.rpc_server
      )
    }
    else {
      
    }
  }
}