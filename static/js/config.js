// Central front-end runtime configuration.
//
// The API base URL is chosen automatically from the page host, so the SAME
// build works locally and in production with no edits at deploy time:
//   - served from localhost/127.0.0.1  -> local backend on :8001
//   - served from anywhere else (prod) -> the Render backend
//
// To point at a different backend, change ONLY the two URLs below.
(function () {
    const host = window.location.hostname;
    const isLocal = host === 'localhost' || host === '127.0.0.1';

    window.APP_CONFIG = {
        apiBaseUrl: isLocal
            ? 'http://localhost:8001'
            : 'https://mrparracho-github-io.onrender.com',
    };
})();
