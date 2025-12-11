import core from "@actions/core";
import { javascriptDependencies } from "./langs/javascript.js";

const language = core.getInput("language", { required: true });

if (language === "javascript") {
    javascriptDependencies();
};