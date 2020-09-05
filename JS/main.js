// on page ready
$(() => {
  // json editor config
  const editor = document.querySelector('#editor');
  const highlight = editor => {
    // highlight.js does not trims old tags,
    // let's do it by this hack.
    editor.textContent = editor.textContent
    hljs.highlightBlock(editor)
  }
  const jar = CodeJar(editor, highlight, {tab: ' '.repeat(2)});
  
  // create editor placeholder
  var isEdited = false
  $("#editor").focus(function() {
    if (!isEdited == true) {
      $("#editor").html("")
      $("#editor").removeClass("editor_empty")
      isEdited = true
    }
  })
  $("#editor").focusout(function() {
    if($("#editor").html() == "") {
      $("#editor").html("JSON")
      $("#editor").addClass("editor_empty")
      isEdited = false
    }
  })
});