/**
 * @copyright NHCarrigan
 * @license Naomi's Public License
 * @author Naomi Carrigan
 */
import core from "@actions/core";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

export const javaDependencies = () => {
  const checkForUnpinned = (dependencies) => {
    return dependencies.filter(
      ([_name, version]) =>
        version.includes("[") ||
        version.includes("(") ||
        version.includes(")") ||
        version.includes("+") ||
        version === "latest" ||
        version === "LATEST" ||
        version.includes("+")
    );
  };

  const checkDevDependencies = core.getBooleanInput("dev-dependencies", {
    required: true,
  });

  const pomPath = join(process.cwd(), "pom.xml");
  const gradlePath = join(process.cwd(), "build.gradle");
  const gradleKotlinPath = join(process.cwd(), "build.gradle.kts");

  let dependencies = [];
  let devDependencies = [];

  if (existsSync(pomPath)) {
    const pomFile = readFileSync(pomPath, "utf8");
    const dependencyMatches = [
      ...pomFile.matchAll(
        /<dependency>[\s\S]*?<groupId>([^<]+)<\/groupId>[\s\S]*?<artifactId>([^<]+)<\/artifactId>[\s\S]*?<version>([^<]+)<\/version>[\s\S]*?<\/dependency>/g
      ),
    ];

    dependencies = dependencyMatches.map((match) => {
      const groupId = match[1].trim();
      const artifactId = match[2].trim();
      const version = match[3].trim();
      return [`${groupId}:${artifactId}`, version];
    });
  } else if (existsSync(gradlePath) || existsSync(gradleKotlinPath)) {
    const gradleFile = readFileSync(
      existsSync(gradlePath) ? gradlePath : gradleKotlinPath,
      "utf8"
    );
    const isKotlinDsl = existsSync(gradleKotlinPath);
    const lines = gradleFile.split("\n");

    for (const line of lines) {
      const trimmed = line.trim();
      if (
        trimmed.includes("implementation") ||
        trimmed.includes("api") ||
        trimmed.includes("compile")
      ) {
        let match;
        if (isKotlinDsl) {
          match = trimmed.match(
            /(?:implementation|api|compile)(?:\(|\(|["'])([^:]+):([^:]+):([^"')]+)/
          );
        } else {
          match = trimmed.match(
            /(?:implementation|api|compile)(?:\s+\(|\(|['"])([^:]+):([^:]+):([^'")]+)/
          );
        }
        if (match) {
          const groupId = match[1].trim();
          const artifactId = match[2].trim();
          const version = match[3].trim();
          dependencies.push([`${groupId}:${artifactId}`, version]);
        }
      } else if (
        checkDevDependencies &&
        (trimmed.includes("testImplementation") ||
          trimmed.includes("testCompile"))
      ) {
        let match;
        if (isKotlinDsl) {
          match = trimmed.match(
            /(?:testImplementation|testCompile)(?:\(|\(|["'])([^:]+):([^:]+):([^"')]+)/
          );
        } else {
          match = trimmed.match(
            /(?:testImplementation|testCompile)(?:\s+\(|\(|['"])([^:]+):([^:]+):([^'")]+)/
          );
        }
        if (match) {
          const groupId = match[1].trim();
          const artifactId = match[2].trim();
          const version = match[3].trim();
          devDependencies.push([`${groupId}:${artifactId}`, version]);
        }
      }
    }
  } else {
    core.setFailed(
      `Package file not found at ${pomPath}, ${gradlePath}, or ${gradleKotlinPath}`
    );
    process.exit(1);
  }

  const unpinnedDependencies = checkForUnpinned(dependencies);
  const unpinnedDevDependencies = checkDevDependencies
    ? checkForUnpinned(devDependencies)
    : [];

  const failures = {
    dependencies: unpinnedDependencies,
  };

  if (checkDevDependencies) {
    failures.devDependencies = unpinnedDevDependencies;
  }

  if (Object.values(failures).every((array) => array.length === 0)) {
    core.setOutput("success", true);
    process.exit(0);
  } else {
    core.setFailed(JSON.stringify(failures, null, 2));
    process.exit(1);
  }
};

