### v1.3.8 9/21/2018

 - fix: popup simple list is too short
 - fix: store all tabs in all window command not work
 - change: untitled list will show the title of tabs in popup simple list
 - change: do not display the change logs in about page
 - change: apply the nightmode to the popup simple list

### v1.3.7 9/19/2018

 - feat: search function in the detail list page & add an option to allow to enable or disable it

### v1.3.6 9/17/2018

 - fix: cover browser action in firefox
 - fix: auth button invalid
 - fix: store multi window failed in firefox
 - fix: vuetify expansion-panel bug
 - fix: open list page bug
 - feat: add an option to allow display context button on all elements
 - feat: add an option to exclude illegal URL
 - feat: add an option to remove duplicate

### v1.3.5 9/10/2018

 - fix: simple list
 - fix: style of options page

### v1.3.4 9/9/2018

 - fix: item click cannot be removed problem
 - fix: store all tabs from all windows
 - fix: create time and title overlap on small screen

### v1.3.3 9/7/2018

 - pref: reduce size
 - fix: make sure remote options is same as local
 - feat: allow other extension send message to better onetab

### v1.3.2 9/5/2018

 - pref: use vuex store options and login status
 - feat: add an option to alert before removing list
 - fix: make conflict if local is not empty after login (avoid directly downloading if local is not empty)

### v1.3.1 9/2/2018

 - feat: add an option to allow using night mode by default
 - feat: add an option to allow choosing items displayed
 - feat: add an option to allow hiding favicon
 - feat: add an option to allow useing fixed toolbar
 - change: hiding dialog after imported
 - change: put imported lists before current lists

### v1.3.0 8/31/2018

 - feat: better onetab sync server (it is provided by a self-hosted server, with unlimited storage space, allow authorize with google / github account now) !IMPORTANT
 - feat: save list to google drive (we will allow user access the saved file and import manually currently) !IMPORTANT
 - change: some icons changed
 - change: add a gitter link (you can get communicate with the developer instantly)
 - feat: allow set list color just need to click the tabs label
 - change: new logo

### v1.2.1 8/13/2018

 - fix: context menus click handler won't be called

### v1.2.0 8/12/2018

 - fix: some problem left over last version
 - feat: allow store two sides
 - feat: auto disable
 - change: group options
 - feat: add an option to allow cover browser action when current page is new tab page

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
