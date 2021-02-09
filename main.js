import { KEYS } from './globals.js';
import { Text } from './text.js';

const converter = new showdown.Converter();

const app = new Vue({
  el: '#app',

  data: {
    code: 'السلام',
    capsLock: null,
  },

  created() {},

  methods: {
    insertLink() {
      let link = window.prompt('Enter Link');
      if (link) {
        if (currentEditor === $preview) {
          let selectedText = document.getSelection().toString();
          console.log(selectedText.toString());
          if (!selectedText || selectedText.length === 0) {
            selectedText = link;
          }
          document.execCommand(
            'insertHTML',
            false,
            '<a href="' + link + '" target="_blank">' + selectedText + '</a>'
          );
        } else {
          this.wrapSelected(['[', '](' + link + ')']);
        }
      }
    },
    insertParenthesis() {
      this.wrapSelected(['(', ')']);
    },
    insertBrackets() {
      this.wrapSelected(['[', ']']);
    },
    insertCurlyBrackets() {
      this.wrapSelected(['{', '}']);
    },
    insertImage() {
      let link = window.prompt('Enter Image Link');
      if (link) {
        if (currentEditor === $preview) {
          this.wrapSelected(['<a href="', '">' + link + '</a>']);
        } else {
          this.wrapSelected(['[', '](' + link + ')']);
        }
      }
    },
    insertCode() {
      if (currentEditor === $preview) {
        const selectedText = document.getSelection();
        document.execCommand(
          'insertHTML',
          false,
          `<pre><code>\n${selectedText}\n</code></pre><br>`
        );
      } else {
        this.wrapSelected(['```\n', '\n```']);
      }
    },
    insertBold() {
      if (currentEditor === $preview) {
        const [start, end] = [$preview.selectionStart, $preview.selectionEnd];
        const selectedText = this.preview.substring(start, end);
        document.execCommand('bold', false, selectedText);
      } else {
        this.wrapSelected(['**', '**']);
      }
    },
    insertItalic() {
      if (currentEditor === $preview) {
        const selectedText = document.getSelection();
        document.execCommand('italic', false, selectedText);
      } else {
        this.wrapSelected(['_', '_']);
      }
    },
    wrapSelected([A, B]) {
      let start, end, selectedText, text, offset;
      console.log(currentEditor);
      if (currentEditor === $code) {
        [start, end] = [$code.selectionStart, $code.selectionEnd];
        selectedText = this.code.substring(start, end);
        text = `${A}${selectedText}${B}`;
        document.execCommand('insertText', false, text);
        offset = A.length;
        $code.selectionStart = start + offset;
        $code.selectionEnd = end + offset;
      }
      console.log('wrapSelected', text);
    },

    indent(evt) {
      console.log('indent');
      document.execCommand('insertText', false, '\t');
    },
    outdent(evt) {
      console.log('outdent');
      document.execCommand('outdent');
    },

    saveText() {
      Text.Download(this.code, 'saved.md');
    },
  },

  computed: {
    preview() {
      return converter.makeHtml(this.code);
    },

    lineNumbers() {
      let numbers = [1];
      for (let i = 0; i < this.code.length; i++) {
        if (this.code[i] === '\n') {
          numbers.push(numbers.length + 1);
        }
      }
      return numbers.join('<br/>');
    },

    length() {
      return this.code.length;
    },
  },
});

// HTML Elements
let $lineNumbers,
  $code,
  $preview,
  currentEditor,
  $editorSelect,
  $directionSelect;

function initDocumentElements() {
  $lineNumbers = document.getElementById('lineNumbers');
  $code = document.getElementById('code');
  $preview = document.getElementById('preview');
  $directionSelect = document.getElementById('direction-select');
  $editorSelect = document.getElementById('editor-select');

  if ($directionSelect.value === 'ltr') {
    changeDirection('ltr');
  } else {
    changeDirection('rtl');
  }

  $directionSelect.onchange = e => {
    if (e.target.value === 'ltr') {
      changeDirection('ltr');
    } else {
      changeDirection('rtl');
    }
  };

  if ($editorSelect.value === 'markdown') {
    showMarkdown();
  } else {
    hideMarkdown();
  }
  $editorSelect.onchange = e => {
    if (e.target.value === 'markdown') {
      showMarkdown();
    } else {
      hideMarkdown();
    }
  };
  $code.addEventListener('focus', () => (currentEditor = $code));
  $preview.addEventListener('focus', () => (currentEditor = $preview));
}

const showMarkdown = () => {
  currentEditor = $code;
  $code.style.display = 'block';
  $preview.style.gridColumn = '1';
  $lineNumbers.style.display = 'block';
};

const hideMarkdown = () => {
  currentEditor = $preview;
  $code.style.display = 'none';
  $preview.style.gridColumn = 'span 2';
  $lineNumbers.style.display = 'none';
};

const changeDirection = direction => {
  $code.style.direction = direction;
  $preview.style.direction = direction;
};

document.addEventListener('keydown', evt => {
  // Update CapsLock state
  app.capsLock = evt.getModifierState('CapsLock');

  // Ctrl + S: Saves (and downloads) markdown in ".md" format
  if (evt.keyCode == KEYS.S && (evt.ctrlKey || evt.metaKey)) {
    evt.preventDefault();
    app.saveText();
    return false;
  }
});

// Drag and Drop loads text file
// Prevent browser from viewing the file as a page upon dropping it accidentally outside the dropbox borders
window.URL = window.URL || window.webkitURL;
window.addEventListener('dragenter', e => {
  e.preventDefault();
});
window.addEventListener('dragover', e => {
  e.preventDefault();
});
window.addEventListener('drop', e => {
  e.preventDefault();
});
// Dropping a text.md file loads it.
document.addEventListener(
  'drop',
  function (evt) {
    evt.preventDefault();
    evt.stopPropagation();
    Text.LoadFile(evt.dataTransfer.files[0])
      .then(text => {
        app.code = text;
      })
      .catch(console.error);
  },
  false
);

window.addEventListener('load', () => {
  initDocumentElements();
  // bind text area with num of lines column (y-scrolling)
  $code.addEventListener('scroll', evt => {
    $lineNumbers.scrollTop = $code.scrollTop;
  });
});

var turndownService = new TurndownService();
var codeElement = document.getElementById('code');
document.getElementById('preview').addEventListener(
  'input',
  e => {
    var markdown = turndownService.turndown(e.target.innerHTML);
    codeElement.value = markdown;
  },
  false
);
