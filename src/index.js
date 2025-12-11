/**
 * @copyright NHCarrigan
 * @license Naomi's Public License
 * @author Naomi Carrigan
 */
import core from "@actions/core";
import { javascriptDependencies } from "./langs/javascript.js";
import { pythonDependencies } from "./langs/python.js";
import { rubyDependencies } from "./langs/ruby.js";
import { phpDependencies } from "./langs/php.js";
import { rustDependencies } from "./langs/rust.js";
import { goDependencies } from "./langs/go.js";
import { javaDependencies } from "./langs/java.js";
import { dotnetDependencies } from "./langs/dotnet.js";

const language = core.getInput("language", { required: true }).toLowerCase();

if (language === "javascript") {
    javascriptDependencies();
    process.exit(0);
}

if (language === "python") {
    pythonDependencies();
    process.exit(0);
}

if (language === "ruby") {
    rubyDependencies();
    process.exit(0);
}

if (language === "php") {
    phpDependencies();
    process.exit(0);
}

if (language === "rust") {
    rustDependencies();
    process.exit(0);
}

if (language === "go") {
    goDependencies();
    process.exit(0);
}

if (language === "java" || language === "kotlin") {
    javaDependencies();
    process.exit(0);
}

if (language === "dotnet" || language === "csharp" || language === "c#") {
    dotnetDependencies();
    process.exit(0);
}

core.setFailed(`Specified language ${language} is not supported`);
process.exit(1);