import { createApp } from "vue";

import { Quasar } from "quasar";
import quasarLang from "quasar/lang/zh-CN";
import quasarIconSet from "quasar/icon-set/svg-material-icons";

// Import Quasar css
import "quasar/src/css/index.sass";
// Import Quasar extras
import "./quasar_extras.ts";

// Import Tailwindcss and custom global css
import "./global.css";

import App from "./App.vue";
createApp(App)
  .use(Quasar, {
    plugins: {}, // import Quasar plugins and add here
    lang: quasarLang,
    iconSet: quasarIconSet,
  })
  .mount("#app");
