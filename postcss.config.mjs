/** PostCSS sans Tailwind — @tailwindcss/postcss v4 lance des worker threads
 *  (Module.register) qui echouent avec EAGAIN sur hebergement mutualise cPanel. */
const config = {
  plugins: {},
};

export default config;
