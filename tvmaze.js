"use strict";

const $showsList = $("#shows-list");
const $episodesList = $("#episodes-list");
const $episodesArea = $("#episodes-area");
const $searchForm = $("#search-form");

const useIfNoImgSrc = "http://tinyurl.com/missing-tv";
const baseAPI_URL = "http://api.tvmaze.com/shows";

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(searchValue) {
  const response = await axios.get(
    `http://api.tvmaze.com/search/shows?q=${searchValue}`
  );
  return response.data.map((currShow) => {
    const show = currShow.show;
    return {
      id: show.id,
      name: show.name,
      summary: show.summary ? show.summary : "No show description provided",
      image: show.image ? show.image.original : useIfNoImgSrc,
    };
  });
}

/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img 
              src="${show.image}"
              alt="${show.name}" 
              class="w-25 mr-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button 
                class="btn btn-outline-light btn-sm Show-getEpisodes"
                id="#episodesList">
               Episodes
             </button>
           </div>
         </div>  
       </div>
      `
    );

    $showsList.append($show);
  }
}

/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#search-query").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (event) {
  event.preventDefault();
  await searchForShowAndDisplay();
});

/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id) {
  const response = await axios.get(`${baseAPI_URL}/${id}/episodes`);
  console.log(response);
  return response.data.map((event) => ({
    id: event.id,
    name: event.name,
    season: event.season,
    number: event.number,
  }));
}

/** Clear the episodesList, and loop through the episodes to create new LIs for each.
 *  Append each item to the episodes list, and show them on the DOM
 */

function populateEpisodes(episodes) {
  $episodesList.empty();

  for (let episode of episodes) {
    const $item = $(
      `<li>
         ${episode.name}
         (season ${episode.season}, episode ${episode.number})
       </li>
      `
    );

    $episodesList.append($item);
  }

  $episodesArea.show();
}

/** Handle click on episodes button: get episodes for show and display */

async function getEpisodesAndDisplay(event) {
  const showId = $(event.target).closest(".Show").data("show-id");
  const episodes = await getEpisodesOfShow(showId);
  populateEpisodes(episodes);
}

$showsList.on("click", ".Show-getEpisodes", getEpisodesAndDisplay);
