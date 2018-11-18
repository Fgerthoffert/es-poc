import { refreshVelocity } from '../utils/velocity/index.js';
import { executeQuery, esSearch } from '../utils/query/index.js';
import { getRepoNames } from '../utils/misc/index.js';

const getReposQuery = {
  "index": "issues",
  "body": {
    "size": 0,
    "aggs": {
      "unique_repos": {
        "terms": {"field": "repo.name.keyword"}
      }
    }
  }
};

export default {
    state: {
        repos: [],                                                                // Array of issues grouped by repository
        velocity: [],                                                             // Array of repos with velocity data
        query: '*',                                                               // ES query string
        loadingCount: 0,                                                          // Number of query left to load, if > 0 display LoadingIndicator
        loadingMessage: 'Loading data from Elasticsearch and computing velocity', // Message to be displayed in LoadingIndicator
    },
    reducers: {
        setQuery(state, payload) {return { ...state, query: payload };},
        setRepos(state, payload) {return { ...state, repos: payload };},
        addRepo(state, payload) {return { ...state, repos: [...state.repos, payload] };},
        setVelocity(state, payload) {return { ...state, velocity: payload };},
        addVelocity(state, payload) {return { ...state, velocity: [...state.velocity, payload] };},
        setLoadingCount(state, payload) {return { ...state, loadingCount: payload };},
        decrementLoadingCount(state, payload) {return { ...state, loadingCount: state.loadingCount-1 };},
        setLoadingMessage(state, payload) {return { ...state, loadingMessage: payload };},
    },
    effects: {
        async initIssues(payload, rootState) {
            this.setLoadingCount(1);

            const aggregationRepos = await esSearch(getReposQuery);
            const availableRepos = aggregationRepos.aggregations.unique_repos.buckets.map(repo => repo.key);
            this.setLoadingCount(availableRepos.length);

            console.log(availableRepos);
            availableRepos.forEach((repo) => {
              console.log('Executing query for Repo: ' + repo);
              esSearch({
                "index": "issues",
                "body": {
                  "query": {
                    "match": {
                      "repo.name": repo
                    }
                  },
                  "size": 40000,
                  "_source": ["closedAt", "title", "repo.name"]
                }
              }).then(result => {
                console.log('Calculating velocity for for: ' + repo);
                const issues = result.hits.hits.map(source => source._source);
                console.log(issues);
                return refreshVelocity(issues);
              }).then(result => {
                console.log(result);
                console.log('Done, adding Repo: ' + repo + ' to state');
                this.addVelocity({...result, title: repo});
                this.setLoadingMessage('Finished loading and computing data for ' + repo);
                this.decrementLoadingCount();
              });
            })
            /* Dummy/dirty/remporary code just to extract some of the data for the mock state.
            let kibanacpt=0;
            let elasticcpt=0;
            console.log(JSON.stringify(issues.filter((issue) => {
                if (issue.repo.name === 'kibana' && kibanacpt < 1000) {
                    kibanacpt++;
                    return true;
                } else if (issue.repo.name === 'elasticsearch' && elasticcpt < 1000) {
                    elasticcpt++;
                    return true;
                } else {
                    return false;
                }
            })));
            */
        }
    }
};
