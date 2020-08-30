const clone = (jq, template) => jq(`${template}.template`).clone();
const stripTemplate = element => element.removeClass('template');

/** Clone a template

  {
    template: <Template Selector String>
    win: <Window Object>
  }

  @returns
  <Cloned Object>
*/
module.exports = ({template, win}) => {
  return stripTemplate(clone(win.jQuery, template));
};
