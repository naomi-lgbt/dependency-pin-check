# Dependency Pin Check

This is a GitHub Action to check that your project dependencies are pinned to specific versions instead of using semver ranges. This helps prevent security risks from installing packages with unpinned version ranges.

## Supported Languages

- **JavaScript/Node.js** - Checks `package.json`
- **Python** - Checks `requirements.txt`, `requirements-dev.txt`, and `pyproject.toml` (Poetry)
- **Ruby** - Checks `Gemfile`
- **PHP** - Checks `composer.json`
- **Rust** - Checks `Cargo.toml`
- **Go** - Checks `go.mod`
- **Java/Kotlin** - Checks `pom.xml` (Maven) and `build.gradle`/`build.gradle.kts` (Gradle)
- **.NET/C#** - Checks `packages.config`, `.csproj` files, and `Directory.Build.props`

## Usage

### Basic Example

```yml
steps:
  - name: Checkout Source Files
    uses: actions/checkout@v4

  - name: Validate Dependencies
    uses: naomi-lgbt/dependency-pin-check@v2
    with:
      language: javascript
      dev-dependencies: true
      peer-dependencies: true
      optional-dependencies: true
```

## Inputs

### Required Inputs

| Input | Description | Type |
|-------|-------------|------|
| `language` | Programming language to check dependencies for. Supported values: `javascript`, `python`, `ruby`, `php`, `rust`, `go`, `java`, `kotlin`, `dotnet`, `csharp`, `c#` | string |
| `dev-dependencies` | Whether to check dev dependencies (not applicable for Go) | boolean |

### Optional Inputs

| Input | Description | Type | Default | Applicable Languages |
|-------|-------------|------|---------|---------------------|
| `peer-dependencies` | Whether to check peer dependencies | boolean | `false` | JavaScript only |
| `optional-dependencies` | Whether to check optional dependencies | boolean | `false` | JavaScript only |

## Language-Specific Examples

### JavaScript/Node.js

```yml
- name: Validate JavaScript Dependencies
  uses: naomi-lgbt/dependency-pin-check@v2
  with:
    language: javascript
    dev-dependencies: true
    peer-dependencies: true
    optional-dependencies: true
```

**Checks for unpinned versions:** `^`, `~`, `>=`, `>`, `=`

### Python

```yml
- name: Validate Python Dependencies
  uses: naomi-lgbt/dependency-pin-check@v2
  with:
    language: python
    dev-dependencies: true
```

**Checks for unpinned versions:** `>=`, `~=`, `>`, `<`, `!=`, `*`, empty versions  
**Note:** `==` is considered pinned (exact version)

### Ruby

```yml
- name: Validate Ruby Dependencies
  uses: naomi-lgbt/dependency-pin-check@v2
  with:
    language: ruby
    dev-dependencies: true
```

**Checks for unpinned versions:** `~>`, `>=`, `>`, `<`, `*`, empty versions

### PHP

```yml
- name: Validate PHP Dependencies
  uses: naomi-lgbt/dependency-pin-check@v2
  with:
    language: php
    dev-dependencies: true
```

**Checks for unpinned versions:** `^`, `~`, `>=`, `>`, `<`, `*`, `||`, version ranges

### Rust

```yml
- name: Validate Rust Dependencies
  uses: naomi-lgbt/dependency-pin-check@v2
  with:
    language: rust
    dev-dependencies: true
```

**Checks for unpinned versions:** `^`, `~`, `>=`, `>`, `<`, `*`, `||`

### Go

```yml
- name: Validate Go Dependencies
  uses: naomi-lgbt/dependency-pin-check@v2
  with:
    language: go
    dev-dependencies: false
```

**Checks for unpinned versions:** `>=`, `^`, `~`, `>`, `<`, `latest`  
**Note:** Go doesn't have dev dependencies, so `dev-dependencies` is ignored

### Java/Kotlin

```yml
- name: Validate Java Dependencies
  uses: naomi-lgbt/dependency-pin-check@v2
  with:
    language: java
    dev-dependencies: true
```

```yml
- name: Validate Kotlin Dependencies
  uses: naomi-lgbt/dependency-pin-check@v2
  with:
    language: kotlin
    dev-dependencies: true
```

**Checks for unpinned versions:** Version ranges `[`, `(`, `)`, `+`, `latest`  
**Supports:** Maven (`pom.xml`) and Gradle (`build.gradle`, `build.gradle.kts`)

### .NET/C#

```yml
- name: Validate .NET Dependencies
  uses: naomi-lgbt/dependency-pin-check@v2
  with:
    language: dotnet
    dev-dependencies: true
```

```yml
- name: Validate C# Dependencies
  uses: naomi-lgbt/dependency-pin-check@v2
  with:
    language: csharp
    dev-dependencies: true
```

```yml
- name: Validate C# Dependencies
  uses: naomi-lgbt/dependency-pin-check@v2
  with:
    language: c#
    dev-dependencies: true
```

**Checks for unpinned versions:** `>=`, `^`, `~`, `>`, `<`, `*`  
**Note:** Dev dependencies are detected from test projects (`.test`, `.tests`, `.spec`) and packages with `PrivateAssets` attribute

## Output

The action will:
- **Succeed** if all checked dependencies are pinned to specific versions
- **Fail** with a JSON output showing which dependencies are unpinned, organized by dependency type

Example failure output:
```json
{
  "dependencies": [
    ["express", "^4.18.0"],
    ["lodash", "~4.17.21"]
  ],
  "devDependencies": [
    ["jest", ">=29.0.0"]
  ]
}
```

## Live Version

This page is currently deployed. [View the live website.](https://github.com/marketplace/actions/dependency-pin-check)

## Feedback and Bugs

If you have feedback or a bug report, please report them to us in our [Discord server](https://chat.nhcarrigan.com).

## Contributing

If you would like to contribute to the project, you may create a Pull Request containing your proposed changes and we will review it as soon as we are able! Please review our [contributing guidelines](CONTRIBUTING.md) first.

## Code of Conduct

Before interacting with our community, please read our [Code of Conduct](CODE_OF_CONDUCT.md).

## License

This software is licensed under our [global software license](https://docs.nhcarrigan.com/#/license).

Copyright held by Naomi Carrigan.

## Contact

We may be contacted through our [Chat Server](http://chat.nhcarrigan.com) or via email at `contact@nhcarrigan.com`.
