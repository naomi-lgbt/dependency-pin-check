# Dependency Pin Check

This is a GitHub Action to check that your Node.js dependencies in your `package.json` file are pinned to a specific version.

## Usage

```yml
    steps:
      - name: Checkout Source Files
        uses: actions/checkout@v4

      - name: Validate Dependencies
        uses: naomi-lgbt/dependency-pin-check@v1
        with:
            dev-dependencies: true
            peer-dependencies: true
            optional-dependencies: true
```

## Live Version

This page is currently deployed. [View the live website.]

## Feedback and Bugs

If you have feedback or a bug report, please feel free to open a GitHub issue!

## Contributing

If you would like to contribute to the project, you may create a Pull Request containing your proposed changes and we will review it as soon as we are able! Please review our [contributing guidelines](CONTRIBUTING.md) first.

## Code of Conduct

Before interacting with our community, please read our [Code of Conduct](CODE_OF_CONDUCT.md).

## License

This software is licensed under our [global software license](https://docs.nhcarrigan.com/#/license).

Copyright held by Naomi Carrigan.

## Contact

We may be contacted through our [Chat Server](http://chat.nhcarrigan.com) or via email at `contact@nhcarrigan.com`.
