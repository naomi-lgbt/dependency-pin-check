# Naomi's Dependency Validator

This is a quick GitHub action to confirm that all dependencies in a `package.json` file are pinned to a specific semver version.

## Usage

The configuration is minimal - here's an example action:

```yaml
name: Dependency Validation
on:
  pull_request:
    branches:
      - main

jobs:
  validate:
    name: Validate Dependencies are Pinned
    runs-on: ubuntu-20.04

    steps:
      - name: Checkout Source Files
        uses: actions/checkout@v3

      - name: Check Dependencies
        uses: naomi-lgbt/dependency-pin-check@main
```

## Feedback and Bugs

If you have feedback or a bug report, please feel free to open a GitHub issue!

## Contributing

If you would like to contribute to the project, you may create a Pull Request containing your proposed changes and we will review it as soon as we are able! Please review our [contributing guidelines](CONTRIBUTING.md) first.

## Code of Conduct

Before interacting with our community, please read our [Code of Conduct](CODE_OF_CONDUCT.md).

## Licensing

Copyright (C) 2022 Naomi Carrigan

This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at http://mozilla.org/MPL/2.0/.

The full license terms may be viewed in the [LICENSE.md file](./LICENSE.md)

## Contact

We may be contacted through our [Chat Server](http://chat.nhcarrigan.com) or via email at `contact@nhcarrigan.com`.
