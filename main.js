const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;
let splash;
let nameEntry;

app.on('ready', () => {
  // Create splash screen window
  splash = new BrowserWindow({
    width: 1920,
    height: 1080,
    frame: false,
    alwaysOnTop: true,
    fullscreen: true,
    transparent: true,
  });

  splash.loadFile(path.join(__dirname, 'splash.html'));

  // Create name entry window
  nameEntry = new BrowserWindow({
    width: 1920,
    height: 1080,
    frame: true, // Show window frame
    resizable: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    autoHideMenuBar: true, // Automatically hide the menu bar
  });

  // Show the name entry window after the splash screen
  splash.on('closed', () => {
    nameEntry.loadFile(path.join(__dirname, 'enter_name.html'));
    nameEntry.show();

    // Maximize the name entry window to fit the screen
    nameEntry.maximize();
  });

  // Handle name entry submission
  nameEntry.webContents.on('did-finish-load', () => {
    nameEntry.webContents.executeJavaScript(`
      const submitButton = document.getElementById('submit-button');
      submitButton.addEventListener('click', () => {
        const name = document.getElementById('name-input').value;
        if (name) {
          localStorage.setItem('userName', name); // Store the name
          nameEntry.close(); // Close the name entry window

          // Load the main window content after name entry
          if (!mainWindow) {
            mainWindow = new BrowserWindow({
              show: false, // Do not show until ready
              webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
              },
              autoHideMenuBar: true, // Automatically hide the menu bar
            });

            mainWindow.loadFile(path.join(__dirname, 'index.html'));

            // Maximize the main window to fit the screen
            mainWindow.once('ready-to-show', () => {
              mainWindow.maximize(); // Maximize the main window
              mainWindow.show(); // Show main window only after loading
            });
          }
        } else {
          alert('Please enter a name.'); // Alert if no name is entered
        }
      });
    `);
  });

  // Automatically close splash screen after a timeout
  setTimeout(() => {
    splash.destroy(); // Close the splash screen
  }, 6000); // Adjust the timeout to match your splash animation duration
});

// Handle all windows being closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
