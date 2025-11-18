module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }], 
      "nativewind/babel"
    ],
  };
};

// module.exports = function (api) {
//   api.cache(true);
//   return {
//     presets: [
//       ["babel-preset-expo", { jsxImportSource: "nativewind" }], 
//       "nativewind/babel","module:metro-react-native-babel-preset"
//     ],
//     plugins: [
//       [
//         'dotenv-import',
//         {
//           moduleName: '@env',
//           path: '.env',
//         },
//       ],
//     ],
//   };
// };