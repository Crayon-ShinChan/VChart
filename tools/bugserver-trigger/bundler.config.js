/**
 * @type {Partial<import('@internal/bundler').Config>}
 */
module.exports = {
  formats: ['umd'],

  umdOutputFilename: 'index',
  minify: false,
  output: {
    footer: '/* follow me on Twitter! @rich_harris */'
  }
};
