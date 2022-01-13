import searchTextForKeywords from "../utils/searchTextForKeywords.js";
import { readmeKeywords, generalKeywords } from "../keywords.js";
import getHrefFromAnchor from "../utils/getHrefFromAnchor.js";
import { scrapeRepo } from "./scrapeRepo.js";

export const scrapeUserOrganization = async (browser, url) => {
  const data = {
    bioKeywordMatch: false,
    numReposWithHundredStars: 0,
    numRepoReadmeKeywordMatch: 0,
  };
  const page = await browser.newPage();
  // go to organization page and sort repos by number of stars
  await page.goto(url + "?q=&type=all&language=&sort=stargazers");

  const header = await page.$(
    ".d-flex.flex-wrap.flex-items-start.flex-md-items-center.my-3"
  );

  const orgName = await header.$eval(".flex-1 > h1", (e) => e.innerText);
  const orgBio =
    (await header.$eval(".flex-1 > div > div", (e) => e.innerText)) ||
    "no org bio";
  if (orgBio !== "no org bio") {
    const bioContainsKeywords = searchTextForKeywords(orgBio, generalKeywords);
    data["bioKeywordMatch"] = bioContainsKeywords;
  }

  // console.log("org bio contains keywords", bioContainsKeywords);

  let repos = await page.$$(".org-repos.repo-list > div > ul > li");
  if (repos.length === 0) {
    console.log(`No repos for ${orgName}`);
    return new Promise((resolve) => {
      resolve(data);
    });
  }
  // only look at the top 3 repos
  else if (repos.length > 3) {
    repos = repos.slice(0, 3);
  }

  const promises = [];
  for (const repo of repos) {
    const repoUrl = await getHrefFromAnchor(
      repo,
      ".d-flex.flex-justify-between > div > a"
    );
    // console.log(repoUrl);
    const repoPage = await browser.newPage();
    await repoPage.goto(repoUrl);
    promises.push(await scrapeRepo(repoPage));
  }
  const results = await Promise.all(promises);
  for (const result of results) {
    if (result.repoStarCount >= 100) {
      data.numReposWithHundredStars++;
    }
    if (result.isRepoReadmeKeywordMatch) {
      data.numRepoReadmeKeywordMatch++;
    }
  }

  await page.close();
  return new Promise((resolve) => {
    resolve(data);
  });

  // console.log(`Results for ${orgName}`, results);
  // console.log(`Data for ${orgName}`, data);

  // await browser.close();
};
