const express = require("express");
const app = express();
require("dotenv").config();
const axios = require("axios");

const characters = require("./characters.json");
const secretApi = require("./KEY.json");

/**
 * Filter characters that matches input string
 * @param {string} input string to filter
 * @returns {array} characters
 */
function filterCharacter(input) {
  const chars = characters.results;
  if (input === "") return chars;

  let filteredCharacter = chars.filter((char) => {
    if (input === "") {
      console.log("Nothing");
      return char;
    } else if (char.name.toLowerCase().includes(input.toLowerCase())) {
      return char;
    }
  });

  return filteredCharacter;
}
/**
 * Return characters fromm range index to index+100
 * @param {integer} index
 * @returns {array} characters
 */
function getCharacterByIndex(index, chars = characters.results) {
  const startIndex = parseInt(index) * 100;
  const endIndex =
    startIndex + 100 > chars.length ? chars.length : startIndex + 100;
  console.log(startIndex, endIndex);
  return chars.slice(startIndex, endIndex);
}

async function fetchCharacter(charCode) {
  const response = await axios.get(
    `${process.env.COMIC_VINE_CHAR_URL}/${charCode}`,
    {
      params: {
        api_key: process.env.COMIC_VINE_API,
        format: "json",
      },
    }
  );
  return response.data;
}
async function fetchMovies(moviesArr) {
  let movies = await Promise.all(
    moviesArr.map(async (movie) => {
      let response = await axios.get(`${process.env.OMDB_URL}`, {
        params: {
          apikey: process.env.OMDB_API,
          t: movie,
        },
      });
      console.log(response.data);
      return response.data;
    })
  );
  console.log("moviesArr", movies);
  return movies;
}
/**
 * Start server on port
 */
app.listen(process.env.PORT, () => {
  console.log(
    `Server is running on port ${process.env.PORT}: http://localhost:${process.env.PORT}/`
  );
});
/**
 * Default
 */
app.get("/", (req, res) => {
  console.log(req.url);
  return res.send("Hello world");
});
/**
 * Return request from search input
 */
app.get("/search", (req, res) => {
  const input = req.query.input !== "" ? req.query.input.toLowerCase() : "";
  const index = req.query.index !== undefined ? parseInt(req.query.index) : 0;
  console.log(req.query);
  console.log("search input:", req.query.input, input);
  console.log("search i:", req.query.index, index);

  const r = filterCharacter(input);
  max = Math.ceil(r.length / 100);

  const results = {};
  results.maxPage = max;
  results.total = r.length;
  results.previous = index <= 0 ? null : index - 1;
  results.next = index > max ? null : index + 1;
  results.results = getCharacterByIndex(index, r);

  return res.json(results);
});
/**
 * Return a request to get a character details
 */
app.get("/character", async (req, res) => {
  const apiCode = req.query.apiCode;
  let results = await fetchCharacter(apiCode);
  // console.log(results);
  return res.json(results);
});
/**
 * Return a request to get movies
 */
app.get("/movies", async (req, res) => {
  const results = {};
  if (req.query.names === undefined) {
    results.error = "Err";
    return res.json(results);
  }

  let movies = await fetchMovies(req.query.names);
  results.total = movies.length;
  results.results = movies;
  results.error = "OK";
  console.log(movies);
  return res.json(results);
});

// /**
//  * Return request of 100 chars with index pagination
//  * !! TODO
//  */
// app.get("/pagination", (req, res) => {
//   const index = parseInt(req.query.index);
//   console.log(req.query);
//   max = Math.ceil(parseInt(characters.results.length) / 100);

//   const results = {};
//   results.previous = index <= 0 ? null : index - 1;
//   results.next = index > max ? null : index + 1;
//   results.maxPage = max;
//   results.results = getCharacterByIndex(index);

//   return res.json(results);
// });

/**
 * Grab request and send it to third party api
 */

// app.get("/character/:id", (req, res) => {
//   const baseUrl = "https://comicvine.gamespot.com/api/character";
//   console.log(req.url);
//   const url = baseUrl + req.params.id;
//   console.log(process.env.COMIC_VINE_API);
//   // const config = {
//   //   headers: { api_key: "cfe215c3fc74e2628fc972727135f274024b6d99" },
//   // };
//   axios({
//     method: "get",
//     url: url,
//     responseType: "json",
//     headers: {
//       Authorization: process.env.COMIC_VINE_API,
//     },
//   }).then((r) => {
//     return res.json(r.results);
//   });
// });
