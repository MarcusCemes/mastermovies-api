## 📦 Archive notice

This repository was archived on 2020-12-18 in favour of a new website repository.

<br />
<p align="center">
  <a href="https://mastermovies.uk">
    <img src="https://static.mastermovies.uk/logo/normal.png" alt="Logo" width="80" height="80">
  </a>

  <h3 align="center">MasterMovies API v2</h3>

  <p align="center">
    The behind-the-scenes hard-working backend that powers the MasterMovies website!
    <br />
    <a href="https://mastermovies.uk"><strong>Visit MasterMovies »</strong></a>
    &nbsp;
    <a href="https://api.mastermovies.uk"><strong>Try the API »</strong></a>
    &nbsp;
    <a href="https://mastermovies.uk/api"><strong>API spec »</strong></a>
  </p>
</p>


Welcome to the open-source repository for the MasterMovies domain. Feel free to explore the inner workings of the website and see if you can find a way to break it!

This repository may be forced-pushed at any time.


## Getting Started

The repository is a self-contained package that allows you to install required dependencies with npm, and build your own local copy to try out.

### Prerequisites

* Node.js runtime (+npm)
* Postgres database
* (PM2 for easy process management)
* (nginx as a TLS-termination reverse proxy)

The database data is private, everything else is public.

## Install, Build and Launch

1. Clone the repository
2. Install dependencies
3. Build the API
4. (create and populate a .env file)
5. Launch!

```bash
$ git clone https://github.com/MarcusCemes/mastermovies-api.git
$ npm ci
$ echo "PGHOST=/var/run/postgresql\nPGUSER=nodejs\nPGDATABASE=mastermovies" > .env
$ node -r dotenv/config ./build/main/index.js
```

## Security

The secure aspects of MasterMovies are handled using JSON Web Tokens for secure session exchange and resource authorisation, providing the best balance between benefits and drawbacks.

### Header-based JWT sessions

The session is communicated to the server via the Authorisation header (Bearer scheme). State-changing requests (e.g. POST) may return an updated and renewed session token via the JSON response payload.

#### Session restoration

The session JWT is archived in a path-restricted secure cookie so that the session  may be resumed after an initial synchronisation with the API.

#### Authorisation

Credentials are submitted to the API via secure endpoints via a POST request. If the request is validated, the session token or additional authorisation tokens will be returned in the response payload.

#### Concurrency

Session updates are non-atomic and may result in an overwrite conflict. It is up to the client to intelligently manage their session tokens.

#### Session hijacking

To prevent session hijacking, each token also posses a unique `jti` field, which is the hash of a secret stored as a secure HTTP-Only cookie. HTTP-Only cookies are protected against client-side access. To retrieve the secret, low-level access to the browser/filesystem is necessary.

#### Resource Access

##### XHR Requests

The JWT is included in the `Authorisation` header (Bearer scheme). This is secure and conforms to standards.

##### Browser streaming (large downloads)

To authorise a browser download (that does not support headers), a initial XHR request must be made to authorise a unique authorisation token in the form of a signed URL.

The signed URL provides an extended window in which the resource may be access that cannot be revoked. The signed URL is exposed in the address bar and stored in the browser history.

### Summary

```diff
+ Requests are short and efficient, while providing reusable sessions
+ Downloads stay validated after logout
+ Conforms to HTTP standards, no cookie/URL size limitation
- Requires an extra download authorisation step
- The session is not legibly stored on the client, and must be restored from the API before any authorised request
```

## License

Distributed under the Apache 2.0 License. See `LICENSE` for more information.

## Contact

Marcus Cemes - [@MarcusCemes](https://twitter.com/MarcusCemes) - marcus@mastermovies.uk

Project Link: [https://mastermovies.uk](https://mastermovies.uk) - [https://api.mastermovies.uk](https://api.mastermovies.uk)
