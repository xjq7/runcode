module.exports = {
  plugins: {
    autoprefixer: {},
    'postcss-pxtorem': {
      rootValue: 16,
      propList: ['*'],
    },
    'postcss-antd-fixes': {
      // Support multiple prefixes, if you do not custom antd class name prefix, it's not necessary option.
      prefixes: ['vp-antd', 'ant'],
    },
  },
};
