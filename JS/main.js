// on page ready
$(() => {
  $("body").removeClass("hidden")
  
  // json editor config
  const editor = document.querySelector("#editor");
  const highlight = editor => {
    // highlight.js does not trims old tags,
    // let's do it by this hack.
    editor.textContent = editor.textContent
    hljs.highlightBlock(editor)
  }
  const editor_json = CodeJar(editor, highlight, {tab: " ".repeat(2)});
  function AdjustEditorHeight(height) {
      $("#editor").css("max-height", height + "px")
  }
  setTimeout(() => {
    AdjustEditorHeight($("#editor").height())
  }, 1);

  // create editor placeholder
  var isEdited = false
  $("#editor").focus(function() {
    if (!isEdited == true) {
      $(this).html("")
      $(this).removeClass("editor_empty")
      isEdited = true
    }
  })
  $("#editor").focusout(function() {
    if($(this).html() == "") {
      $(this).html("JSON")
      $(this).addClass("editor_empty")
      isEdited = false
    }
  })
  
  // template functions
  function updateJson(json_id = null, json = null, required_auth_type = null) {
    $("#editor").focus()
    editor_json.updateCode(json)
    if (required_auth_type != null) {
      $("#required_auth_type").val(required_auth_type)
    }
    if (json_id != null) {
      $("#json_id").val(json_id)
    }
  }
  var templates = {
    "Hive Engine" : {
      name: "Hive Engine",
      json_id: "ssc-mainnet-hive",
      json: {"contractName":"","contractAction":"","contractPayload":{}},
      required_auth_type: "active",
      options: ["Transfer", "Stake", "Unstake", "Issue", "Buy", "Sell", "Cancel"]
    },
    "Blog Operations" : {
      name: "Blog Operations",
      json_id: "follow",
      json: ["follow",{"follower":"","following":"","what":[""]}],
      required_auth_type: "posting",
      options: ["Follow", "Unfollow", "Mute"]
    },
    "Scot Claim Token" : {
      name: "Scot Claim Token",
      json_id: "scot-claim-token",
      json: [{"symbol":""}],
      required_auth_type: "posting",
      options: ["NEOXAG","PAL","LEO","CCC"]
    }
  }
  var current_template

  $(document).on("click", ".template_button", function() {
    var selection = $(this).text()
    var this_template = templates[selection]
    current_template = this_template
    var sub_templates = $("#sub_templates")

    // adding sub-templates
    if(selection !== "X" && this_template.options.length > 0) {
      sub_templates.html("")
      for(i in this_template.options) {
        sub_templates.append(`<button class="select_normal sub_template_button tbs">` + this_template.options[i] + `</button>`)
      }
      sub_templates.append(`<button class="select_normal sub_template_button tbs crossb">X</button>`)
      sub_templates.removeClass("hidden")
      sub_templates.parent(".top_c_div").removeClass("hidden")
      $("#temp_div").removeClass("nomargin")
      $("#sub_t_heading").removeClass("hidden")
      $("#sub_t_heading").parent(".top_c_div").removeClass("hidden")
    }
    else {
      $("#temp_div").addClass("nomargin")
      sub_templates.addClass("hidden")
      $("#sub_t_heading").addClass("hidden")
      $("#sub_t_heading").parent(".top_c_div").addClass("hidden")
    }

    if(selection !== "X") {
      template = JSON.stringify(this_template.json, null, "  ")
      updateJson(this_template.json_id, template, this_template.required_auth_type)
    }
    else
      updateJson("", null, "posting")
  })

  // sub_template functioning
  $(document).on("click", ".sub_template_button", function() {
    var selection = $(this).text()
    var newJson = JSON.stringify(templates[current_template.name].json)
    newJson = JSON.parse(newJson)
    if (selection != "X") {
      switch(current_template.name) {
        case "Hive Engine":
          var contractName = "tokens", contractAction, contractPayload
          contractAction = selection.split(" ")
          if (contractAction.length > 1)
            contractAction = contractAction[0].toLowerCase() + contractAction[1]
          else
            contractAction = contractAction[0].toLowerCase()
          switch(selection) {
            case "Buy":
            case "Sell":
              contractName = "market"
              contractPayload = {
                "symbol": "",
                "quantity": "",
                "price": ""
              }
              break;
            case "Cancel":
              contractName = "market"
              contractPayload = {
                "type": "",
                "id": ""
              }
              break;
            case "Transfer":
              contractPayload = {
                "symbol": "",
                "to": "",
                "quantity": "",
                "memo": ""
              }
              break;
            case "Stake":
            case "Issue":
              contractPayload = {
                "to": "",
                "symbol": "",
                "quantity": ""
              }
              break;
            case "Unstake":
              contractPayload = {
                "symbol": "",
                "quantity": ""
              }
              break;
          }
          newJson.contractName = contractName
          newJson.contractAction = contractAction
          newJson.contractPayload = contractPayload
          break;

        case "Blog Operations":
          var action
          switch(selection) {
            case "Follow":
              action = "blog"
              break;
            case "Unfollow":
              action = ""
              break;
            case "Mute":
              action = "ignore"
              break;
          }
          newJson[1].what[0] = action
          break;

        case "Scot Claim Token":
          newJson[0].symbol = selection
          break;
      }
    }
    updateJson(null, JSON.stringify(newJson, null, "  "), null)
  })
  $("#broadcast").click(function() {
    
  })
});
