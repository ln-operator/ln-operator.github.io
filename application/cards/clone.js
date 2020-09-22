const clone = (node, template) => node.find(`${template}.template`).clone();
const stripTemplate = element => element.removeClass('template');

/** Clone a template

  {
    node: <Node Container Object>
    template: <Template Selector String>
  }

  @returns
  <Cloned Object>
*/
module.exports = ({node, template}) => {
  return stripTemplate(clone(node, template));
};
