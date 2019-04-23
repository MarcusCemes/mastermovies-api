interface Config {
  base: string;
  port: number;
  film_storage: string;
  view_threshold: number;
}

const config: Config = {
  "base": "https://api.mastermovies.co.uk/",
  "port": 3000,
  "film_storage": process.env.FILM_STORAGE || "/opt/glacier/",
  "view_threshold": 0.2 // percentage of total film size
};

export default config;