<!-- PROJECT LOGO -->
<br />
<p align="center">
  <a href="https://mastermovies.co.uk">
    <img src="https://mastermovies.co.uk/icon.png" alt="Logo" width="80" height="80">
  </a>

  <h3 align="center">MasterMovies API [REST] v2</h3>

  <p align="center">
    The Typescript Node.js source code to the MasterMovies domain
    <br />
    <a href="https://mastermovies.co.uk"><strong>Visit MasterMovies »</strong></a>
    &nbsp;
    <a href="https://api.mastermovies.co.uk"><strong>Try the API »</strong></a>
  </p>
</p>


<!-- ABOUT THE PROJECT -->
Welcome to the open source repository for the MasterMovies domain. Feel free to explore the inner workings of the website and see if you can find a way to break it!


<!-- GETTING STARTED -->
## Getting Started

The repository is a self-contained package that allows you to install required dependencies with npm, and build your own local copy to try out.

### Prerequisites

* Node.js (+npm)
* Postgres ([schema](https://dbdiagram.io/d/5cc82db9f7c5bb70c72fcf48))
* (PM2)
* (nginx)

The database data is private, everything else is public.

## Install, Build and Launch

1. Clone the repository
2. Install dependencies
3. Build the API
3. (create a .env file)
4. Launch!

```bash
$ git clone https://github.com/MarcusCemes/mastermovies-api.git
$ npm ci
$ echo "PGHOST=/var/run/postgresql\nPGUSER=nodejs\nPGDATABASE=mastermovies" > .env
$ node -r dotenv/config ./build/main/index.js
```


<!-- LICENSE -->
## License

Distributed under the Apache 2.0 License. See `LICENSE` for more information.



<!-- CONTACT -->
## Contact

Marcus Cemes - [@MarcusCemes](https://twitter.com/MarcusCemes) - marcus@mastermovies.co.uk

Project Link: [https://mastermovies.co.uk](https://mastermovies.co.uk) - [https://api.mastermovies.co.uk](https://api.mastermovies.co.uk)


### Disclaimer

This repository may be force pushed at any moment.