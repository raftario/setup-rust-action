# setup-rust

[![GitHub Actions status](https://github.com/raftario/setup-rust-action/workflows/Main%20workflow/badge.svg)](https://github.com/raftario/setup-rust-action/actions)

This action sets up a Rust environment for use in actions by:

- downloading and caching a version of Rust by channel and host and adding to PATH
- optionally downloading and caching a custom target
- optionally downloading and caching commonly used cargo subcommands
- optionally downloading and caching cross for cross-compiling

## Usage

See [action.yml](action.yml)

Basic:

```yaml
steps:
- uses: actions/checkout@v1
- uses: raftario/setup-rust-action@v1
  with:
    rust-channel: 'stable'
- run: cargo test
```

Matrix Testing:

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        rust-channel: [ 'stable', 'nightly' ]
        rust-host: [ 'x86_64-unknown-linux-gnu', 'i686-unknown-linux-gnu' ]
    name: Rust ${{ matrix.rust-channel }}-${{ matrix.rust-host }} sample
    steps:
      - uses: actions/checkout@v1
      - uses: raftario/setup-rust-action@v1
        with:
          rust-channel: ${{ matrix.rust-channel }}
          rust-host: ${{ matrix.rust-host }}
      - name: Setup Rust
      - run: cargo test
```

## License

The scripts and documentation in this project are released under the [MIT License](LICENSE)
