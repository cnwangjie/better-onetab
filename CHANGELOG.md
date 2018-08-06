### v1.1.3 8/6/2018

 - fix: remove list item will not open the tab
 - fix: restore list from popup
 - perf: set storage at next tick

### v1.1.2 8/5/2018

 - feat: nightmode
 - feat: add an option to change the position of remove item button
 - change: created time i18n support

### v1.1.1 8/1/2018

 - feat: add an option to turn on the button of context menu in the page
 - fix: do not await sync complete when access storage

### v1.1.0 7/29/2018

 - feat: add an operation to store all tabs in all windows (in context menus and keyboard shortcut)
 - change: add about page with update button and changelogs
 - change: change items of list in detail list page to a tag and it allows the operation of the a tag in the browser (such as copy link address, open in new window, use ctrl+click to open in background) !IMPORTANT
 - fix: make title on buttons available

### v1.0.6 7/27/2018

 - change: change a part of ui
 - change: add a link to keyboard shortcuts

### v1.0.5 7/20/2018

 - feat: add an option to pin new list
 - fix: avoid title input line height increase
 - fix: allow use enter to set title of a list

### v1.0.4 7/14/2018

 - feat: add an option to ignore pinned tab & allow change the order of lists
 - feat: keep tab list expand status

### v1.0.3 6/30/2018

 - fix: temporary use webextension-polyfill to replace chrome-promise
 - fix: store selected tabs in all window (currently store current window only)
 - fix: remove item in tab list will not trigger item clicked handler
 - fix: avoid tab list page being stored
 - fix: fix restore in new window

### v1.0.2 5/24/2018

 - change: supplment i18n message

### v1.0.1 5/20/2018

 - fix: open onetab page when there are no tab in current window

### v1.0.0 5/19/2018

 - feat: Set title of list
 - feat: Popup page with simple list
 - feat: Pin tab list
 - feat: Keyboard shortcuts
 - feat: Options
 - feat: Drag and drop re-ordering
 - feat: Data & options sync
 - feat: Import & export
