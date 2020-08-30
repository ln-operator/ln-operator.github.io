const buttonCopyText = btn => btn.closest('input-group').find('.text-to-copy');
const event = 'click';
const executeCopy = win => win.document.execCommand('copy');
const getTextToCopy = input => input.find('.text-to-copy').get();
const iosDevice = /ipad|iphone|ipod/i;
const inputGroup = '.input-group';
const resetDelayMs = 2000;
const setSelectionRange = target => target.setSelectionRange(0, 999999);
const titleForButton = btn => btn.find('.button-title');

/** Copy selection on click

  {
    copy: <Copy Button Object>
    win: <Window Object>
  }
*/
module.exports = ({copy, win}) => {
  copy.on(event, () => {
    const buttonTitle = titleForButton(copy);

    const buttonText = buttonTitle.text();

    const [target] = getTextToCopy(copy.closest(inputGroup));

    if (win.navigator.userAgent.match(iosDevice)) {
      const isEditable = target.contentEditable;
      const isReadOnly = target.readOnly;

      target.contentEditable = true;
      target.readOnly = true;

      const range = win.document.createRange();

      range.selectNodeContents(target);

      const selection = win.getSelection();

      selection.removeAllRanges();

      selection.addRange(range);

      setSelectionRange(target);

      target.contentEditable = isEditable;
      target.readOnly = isReadOnly;
    } else {
      win.jQuery(target).select();
    }

    executeCopy(win);

    titleForButton(copy).text(copy.data().copiedTitle);

    setTimeout(() => titleForButton(copy).text(buttonText), resetDelayMs);

    return;
  });

  return;
};
