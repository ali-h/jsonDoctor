// on page ready
$(() => {
  $("body").removeClass("hidden")

  // json editor config
  const editor = document.querySelector('#editor');
  const highlight = editor => {
    // highlight.js does not trims old tags,
    // let's do it by this hack.
    editor.textContent = editor.textContent
    hljs.highlightBlock(editor)
  }
  const editor_json = CodeJar(editor, highlight, {tab: ' '.repeat(2)});
  
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
  }
  var templates = {
    "Hive-Engine" : {
      json_id: "ssc-mainnet-hive",
      json: {"contractName":"","contractAction":"","contractPayload":{}},
      required_auth_type: "Active",
      options: ["Transfer", "Stake", "Unstake", "Cancel Unstake", "Delegate", "Undelegate", "Issue", "Buy", "Sell", "Cancel Buy/Sell"]
    },
    "Blog Operations" : {
      json_id: "follow",
      json: ["follow",{"follower":"","following":"","what":[""]}],
      required_auth_type: "Posting",
      options: ["Follow", "Unfollow", "Mute"]
    },
    "Scot Claim Token" : {
      json_id: "scot-claim-token",
      json: [{"symbol":""}],
      required_auth_type: "Posting",
      options: ["NEOAX","PAL","LEO","CCC"]
    }
  }
  var current_template
  var template_button = $(".template_button")
  var sub_templates = $("#sub_templates")
  var sub_template_button = $(".sub_template_button")

  template_button.click(function() {
    var selection = $(this).text()
    var this_template = templates[selection]
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
      template = JSON.stringify(this_template.json, null, '  ')
      updateJson(this_template.json_id, template, this_template.required_auth_type)
    }
  })
});