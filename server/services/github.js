
const axios = require('axios');

const BASE_URL = process.env.GITHUB_API_URL || 'https://api.github.com';

function parseRepoUrl(url) {
  const cleaned = url.replace(/\.git$/, '').replace(/\/$/, '');
  const match = cleaned.match(/(?:github\.com\/)?([^\/]+)\/([^\/]+)$/);
  if (!match) throw new Error('Invalid GitHub repository URL');
  return { owner: match[1], repo: match[2] };
}

function createClient(token) {
  const headers = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'TOKYO-PULSE-Dashboard'
  };
  if (token) headers['Authorization'] = `token ${token}`;
  return axios.create({ baseURL: BASE_URL, headers, timeout: 15000, family: 4 });
}


let rateLimitRemaining = 60;

async function fetchAllPages(client, url, params = {}, maxPages = 3) {
  const results = [];
  let page = 1;

  while (page <= maxPages) {
   
    if (rateLimitRemaining < 5) {
      console.warn(` Rate limit low (${rateLimitRemaining} remaining), stopping pagination`);
      break;
    }

    try {
      const response = await client.get(url, {
        params: { ...params, per_page: 100, page }
      });

      // Update rate limit tracking from response headers
      const remaining = parseInt(response.headers['x-ratelimit-remaining']);
      if (!isNaN(remaining)) rateLimitRemaining = remaining;

      if (!response.data || response.data.length === 0) break;
      results.push(...response.data);

      const linkHeader = response.headers.link;
      if (!linkHeader || !linkHeader.includes('rel="next"')) break;

      page++;
    } catch (err) {
      if (err.response?.status === 403 || err.response?.status === 429) {
        console.warn(' Rate limit hit, returning partial results');
        rateLimitRemaining = 0;
        break;
      }
      throw err;
    }
  }

  return results;
}

async function fetchRepoInfo(client, owner, repo) {
  const { data, headers } = await client.get(`/repos/${owner}/${repo}`);
  const remaining = parseInt(headers['x-ratelimit-remaining']);
  if (!isNaN(remaining)) rateLimitRemaining = remaining;
  console.log(`   Rate limit remaining: ${rateLimitRemaining}`);
  return data;
}


async function fetchCommits(client, owner, repo, hasToken) {
  const maxPages = hasToken ? 5 : 2; 
  const commits = await fetchAllPages(
    client,
    `/repos/${owner}/${repo}/commits`,
    {},
    maxPages
  );

  
  if (hasToken && rateLimitRemaining > 100) {
    console.log('   Fetching detailed stats for up to 30 key commits...');
    const toDetail = commits.slice(0, 30); // Only detail the first 30
    const detailed = await Promise.all(
      toDetail.map(async (c) => {
        try {
          if (rateLimitRemaining < 20) return c;
          const { data, headers } = await client.get(`/repos/${owner}/${repo}/commits/${c.sha}`);
          const rem = parseInt(headers['x-ratelimit-remaining']);
          if (!isNaN(rem)) rateLimitRemaining = rem;
          return data;
        } catch {
          return c;
        }
      })
    );
   
    return [...detailed, ...commits.slice(30)];
  }

  console.log('   Using basic commit data (no individual detail fetches to save rate limit)');
  return commits;
}

async function fetchContributors(client, owner, repo) {
  return fetchAllPages(client, `/repos/${owner}/${repo}/contributors`, {}, 2);
}

async function fetchPullRequests(client, owner, repo) {
 
  if (rateLimitRemaining < 5) {
    console.warn('   Skipping PR fetch — rate limit too low');
    return [];
  }
  return fetchAllPages(
    client,
    `/repos/${owner}/${repo}/pulls`,
    { state: 'all' },
    1 // Just 1 page of PRs to save rate limit
  );
}

async function fetchContributorStats(client, owner, repo) {
  if (rateLimitRemaining < 3) return [];
  try {
    const { data, headers } = await client.get(`/repos/${owner}/${repo}/stats/contributors`);
    const rem = parseInt(headers['x-ratelimit-remaining']);
    if (!isNaN(rem)) rateLimitRemaining = rem;
    return data || [];
  } catch {
    return [];
  }
}

async function fetchRepository(repoUrl, token) {
  const { owner, repo } = parseRepoUrl(repoUrl);
  const client = createClient(token);
  const hasToken = !!token;

  console.log(` Fetching data for ${owner}/${repo}...`);
  console.log(`   Auth: ${hasToken ? 'Token provided (5000 req/hr)' : 'No token (60 req/hr)'}`);

 
  const repoInfo = await fetchRepoInfo(client, owner, repo);

  
  const [commits, contributors, pullRequests, contributorStats] = await Promise.all([
    fetchCommits(client, owner, repo, hasToken),
    fetchContributors(client, owner, repo),
    fetchPullRequests(client, owner, repo),
    fetchContributorStats(client, owner, repo)
  ]);

  console.log(` Fetched: ${commits.length} commits, ${contributors.length} contributors, ${pullRequests.length} PRs`);
  console.log(`   Rate limit remaining: ${rateLimitRemaining}`);

  return { repoInfo, commits, contributors, pullRequests, contributorStats, owner, repo };
}

module.exports = { fetchRepository, parseRepoUrl };
