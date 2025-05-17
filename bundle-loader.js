module.exports = {
    importFiles: () => {
      const images = require.context('./dist/assets/images/design', false, /\.(png|jpe?g|svg)$/);
      return images
    }
}
