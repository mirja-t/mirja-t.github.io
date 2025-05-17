// importFiles.js
// const importFiles = () => {
//   const images = require.context('./dist/assets/images/design', false, /\.(png|jpe?g|svg)$/);
//   return images;
// };
// imageLoader.ts
const importFiles = () => {
  return import.meta.glob(
    '/src/assets/images/design/*.{png,jpg,jpeg,svg}',
    { eager: true, import: 'default' }
  );
};

export default {
  importFiles,
};
