import { createApp } from "vue";

import { Dialog, Loading, Notify, Quasar } from "quasar";
// import quasarLang from "quasar/lang/zh-CN"; // Chinese language
import quasarLang from "quasar/lang/en-US";
import quasarIconSet from "quasar/icon-set/svg-material-icons";

// Import Quasar css
import "quasar/src/css/index.sass";
// Import Quasar extras
import "./quasar_extras.ts";

// Import Tailwindcss and custom global css
import "./global.css";

import App from "./App.vue";
import { router } from "./router/auto-routes";
import { registerWindowRouterObject } from "./composables/route";

const app = createApp(App);

app
  .use(Quasar, {
    plugins: { Notify, Loading, Dialog }, // import Quasar plugins and add here
    lang: quasarLang,
    iconSet: quasarIconSet,
    config: {
      brand: {
        primary: "#1976d2",
        secondary: "#26a69a",
        accent: "#9c27b0",
        dark: "#1d1d1d",
        darkPage: "#121212",
        positive: "#21ba45",
        negative: "#c10015",
        info: "#31ccec",
        warning: "#f2c037",
      },
    },
  })
  .use(router)
  .mount("#app");

registerWindowRouterObject();
