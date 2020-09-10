/** Handle clicks on disconnect button

  {
    win: <Window Object>
  }

  @returns
  <Event Handler Function>
*/
module.exports = ({win}) => {
  return () => {
    win.sessionStorage.clear();

    return win.location.reload(false); 
  };
};
