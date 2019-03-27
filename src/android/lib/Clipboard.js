/**
 * 复制
 */
//复制到剪贴板
let textArea,text;
document.addEventListener('copy',(e)=>{
    if(/textarea/i.test(e.target.nodeName))
    {
        if (e.clipboardData) {
            e.clipboardData.setData('text/plain', text);
        } else if (window.clipboardData) {
            window.clipboardData.setData('Text', text);
        }
        e.preventDefault();
    }
});

function isOS() {
    return window.navigator.userAgent.match(/ipad|iphone/i);
}

function createTextArea(text) {
    textArea = document.createElement('textArea');
    textArea.value = text;
    document.body.appendChild(textArea);
}

function selectText() {
    var range,
        selection;

    if (isOS()) {
        range = document.createRange();
        range.selectNodeContents(textArea);
        selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        textArea.setSelectionRange(0, 999999);
    } else {
        textArea.select();
    }
}

function copyToClipboard() {        
    document.execCommand('copy');
    document.body.removeChild(textArea);
}

export function copy(_t) {
    text = _t
    createTextArea(_t);
    selectText();
    copyToClipboard();
};


