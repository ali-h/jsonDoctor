// on page ready
$(window).bind("load", function() {

  // navigation
  $(".nav_b[nav=true]").click(function() {
    page_num = $(this).attr("pg_num")
    $(".nav_b").each(function() {
      $(this).removeClass("nav_selected")
    })
    $(this).addClass("nav_selected")
    getPages()
  })

  var broadcast_log_height
  function adjustHeight(broadcast_log_height) {
    $("#broadcast_log").css("max-height", broadcast_log_height + "px")
  }

  // def page num
  var page_num = 0
  var getPages = function() {
    if(page_num == 1) {
      $("#p__broadcast").removeClass("hidden")
      $("#p__stream").addClass("hidden")
      $("#p__about").addClass("hidden")

      // set Heights for overflow components
      var editor_height = $("#editor").height()
      $("#editor").css("max-height", editor_height + "px")
      broadcast_log_height = $("#broadcast_log").height()
      adjustHeight(broadcast_log_height)
    }
    else if (page_num == 2) {
      $("#p__stream").removeClass("hidden")
      $("#p__broadcast").addClass("hidden")
      $("#p__about").addClass("hidden")
    }
    else if (page_num == 3) {
      $("#p__about").removeClass("hidden")
      $("#p__stream").addClass("hidden")
      $("#p__broadcast").addClass("hidden")
    }
  }

  var log_num = 0
  // json editor config
  const editor = document.querySelector("#editor");
  const highlight = editor => {
    // highlight.js does not trims old tags,
    // let's do it by this hack.
    editor.textContent = editor.textContent
    hljs.highlightBlock(editor)
  }
  const editor_json = CodeJar(editor, highlight, {tab: " ".repeat(2)});

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

  function log(status, msg) {
    var css_class
    log_num++
    if(status == 0) {
      css_class = "log_warn"
      if(typeof(msg) == 'object') {
        msg = `${msg.msg} <a class="tx_id" target="_blank" href="https://hive.ausbit.dev/tx/${msg.tx_id}">${msg.tx_id}</a>${(msg.block_num !== undefined) ? ` Block# ${msg.block_num}` : ""}`;
      }
    }
    else if(status == 1) {
      css_class = "log_err"
    }
    var log_num_f
    if(log_num < 100) {
      var zeros = "00"
      if(log_num > 9) {
        zeros = "0"
      }
      log_num_f = zeros + log_num
    }
    else
      log_num_f = log_num

    $("#broadcast_log").append(
      `<div class="log">
        <span>`+log_num_f+`</span>
        <span class="`+css_class+`">`+msg+`</span>
      </div>`
    )
  }
  
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
      required_auth_type: "Active",
      options: ["Transfer", "Stake", "Unstake", "Issue", "Buy", "Sell", "Cancel", "NFT Buy", "NFT Sell"]
    },
    "Blog Operations" : {
      name: "Blog Operations",
      json_id: "follow",
      json: ["follow",{"follower":"","following":"","what":[""]}],
      required_auth_type: "Posting",
      options: ["Follow", "Unfollow", "Mute"]
    },
    "Scot Claim Token" : {
      name: "Scot Claim Token",
      json_id: "scot-claim-token",
      json: [{"symbol":""}],
      required_auth_type: "Posting",
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
      adjustHeight(broadcast_log_height)
    }

    if(selection !== "X") {
      template = JSON.stringify(this_template.json, null, "  ")
      updateJson(this_template.json_id, template, this_template.required_auth_type)
    }
    else
      updateJson("", null, "Posting")

    // adjust height again if body resized
    var html = $("#broadcast_log").html()
    $("#broadcast_log").html("")
    adjustHeight($("#broadcast_log").height())
    $("#broadcast_log").html(html)
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
            case "NFT Buy":
              contractName = "nftmarket"
              contractAction = "buy"
              contractPayload = {
                "symbol": "",
                "nfts": [],
                "marketAccount": "ali-h"
              }
              break;
            case "NFT Sell":
              contractName = "nftmarket"
              contractAction = "sell"
              contractPayload = {
                "symbol": "",
                "nfts": [],
                "price": "",
                "priceSymbol": "",
                "fee": 0
              }
              break;
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
  $("#rpc_server").change(function() {
    hive.api.setOptions({ url: $(this).val() })
    log(0, "rpc_server set to " + $(this).val())
  })
  $("#use_keychain").change(function() {
    if ($(this).val() == "true") {
      try {
      hive_keychain.requestHandshake(function(res) {
        log(0, "hive_keychain use enabled.")
        $("#private_key").attr("disabled", true)
      })
      } catch(err) {
        log(1, "ERR: hive_keychain handshake failed.")
        $("#private_key").removeAttr("disabled")
        $(this).val("false")
      }
    }
    else {
      $("#private_key").removeAttr("disabled")
      log(0, "hive_keychain use disabled.")
    }
  })
  // broadcast function
  $("#broadcast").click(function() {
    $(this).attr("disabled", true)
    var json = editor_json.toString()
    if (json == "JSON" && $("#editor").attr("class").includes("editor_empty")) {
      json = ""
    }
    var data = {
      private_key : $("#private_key").val(),
      username : $("#username").val(),
      json_id : $("#json_id").val(),
      json : json,
      required_auth_type : $("#required_auth_type").val(),
      use_keychain : $("#use_keychain").val(),
      rpc_server : $("#rpc_server").val(),
    }
    broadcast(data, function(status, res) {
      log(status, res)
      $("#broadcast").removeAttr("disabled")
    })
  })

  function adjust_log_scroll() {
    $('#broadcast_log').scrollTop($('#broadcast_log')[0].scrollHeight)
  }
  $("#broadcast_log").bind("DOMSubtreeModified", adjust_log_scroll)

  try {
    hive_keychain.requestHandshake(function(res) {
      log(0, "hive_keychain connected.")
    })
  } catch(err) {
    log(1, "ERR: hive_keychain handshake failed.")
  }
  hive.api.setOptions({ url: 'https://anyx.io/' })

  // wait for the webfonts to load page
  function waitForWebfonts(fonts, callback) {
    var loadedFonts = 0;
    var onetime = 0
    for(var i = 0, l = fonts.length; i < l; ++i) {
        (function(font) {
            var node = document.createElement('span');
            // Characters that vary significantly among different fonts
            node.innerHTML = 'giItT1WQy@!-/#';
            // Visible - so we can measure it - but not on the screen
            node.style.position      = 'absolute';
            node.style.left          = '-10000px';
            node.style.top           = '-10000px';
            // Large font size makes even subtle changes obvious
            node.style.fontSize      = '300px';
            // Reset any font properties
            node.style.fontFamily    = 'sans-serif';
            node.style.fontVariant   = 'normal';
            node.style.fontStyle     = 'normal';
            node.style.fontWeight    = 'normal';
            node.style.letterSpacing = '0';
            document.body.appendChild(node);

            // Remember width with no applied web font
            var width = node.offsetWidth;

            node.style.fontFamily = font + ', sans-serif';

            var interval;
            function checkFont() {
                // Compare current width with original width
                if(node && node.offsetWidth != width) {
                    ++loadedFonts;
                    node.parentNode.removeChild(node);
                    node = null;
                }

                // If all fonts have been loaded
                if(loadedFonts >= fonts.length) {
                    if(interval) {
                        clearInterval(interval);
                    }
                    if(loadedFonts == fonts.length) {
                      if (onetime != 1) {
                        onetime = 1
                        callback();
                        return true;
                      }
                    }
                }
            };

            if(!checkFont()) {
                interval = setInterval(checkFont, 50);
            }
        })(fonts[i]);
    }
  }
  waitForWebfonts(['Encode Sans Condensed', 'Courier New'], function() {
    $("#app").removeClass("hidden")
    $("#loader").addClass("hidden")
    page_num = 1
    getPages()
  })
})
