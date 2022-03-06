# Coincident Spectra

Coincident Spectra is a spectral-microtuning additive synthesizer.

## Try it

Coincident Spectra is live at: https://coincident-spectra.fission.app/

## Setup

Install dependencies.

```shell
npm install
```

## Develop

To work on the application locally:

```shell
npm run dev
```

Navigate to `localhost:3000` in your web browser.

## Build

Export a static build.

```shell
npm run build
```

The build outputs the static site to the `build` directory.

## Publish

The built site publishes with the [Fission CLI](https://guide.fission.codes/developers/cli) and the [Fission publish action](https://github.com/fission-suite/publish-action).

Publishing from the command line is configured in [fission.yaml](fission.yaml). The publish action is configured in [publish.yml](.github/workflows/publish.yml).

See the [Fission Guide](https://guide.fission.codes/developers/installation) and the publish action README if you would like to publish to Fission. Mostly this means making a Fission account with the CLI, registering a new app, and updating the endpoints in `fission.yaml` and `publish.yml`.

## License

The source code for Coincident Spectra is available under the Apache 2.0 license. Please consult the [Elementary License](https://www.elementary.audio/license) for additional instructions on using the Elementary SDK.

The [social preview image](static/coincident-spectra.png) was created by Jacky Ligon and is under copyright. Please contact the artist if you wish to re-use the image.