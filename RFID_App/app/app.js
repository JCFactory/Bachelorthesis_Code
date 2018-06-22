/*
In NativeScript, the app.js file is the entry point to your application.
You can use this file to perform app-level initialization, but the primary
purpose of the file is to pass control to the app’s first module.
*/

const application = require("application");
application.setCssFileName("app.css");

application.start({ moduleName: "home-view/home-view" });
// application.start({ moduleName: "home-view.1/home-view" });
