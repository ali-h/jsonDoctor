// on page ready
$(() => {
  // json editor config
  const editor = document.querySelector('#editor');
  const jar = CodeJar(editor, Prism.highlightElement, {tab: ' '.repeat(2)});
});