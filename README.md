
## Introduction

This project queries an elasticsearch index containing a set of GitHub issue and calculate a 4 weeks rolling average of weekly completion velocity. This provides an trends on a project's team pace and helps identify variations over long running projects.

One area is built per fetched repository, each datapoint on the chart represent an average of the sum of closed issues, per week, over the previous 4 weeks.

## Run

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app), main commands: 

* To install all dependencies `npm install`
* To run the project in development mode: `npm start` - [http://localhost:4000](http://localhost:4000)
* To run tests: `npm test`
* To build the project: `npm run build`

## Data

Data can be easily fetched through Github API v4 (GraphQL), using the following query:

```$graphql
query ($repo_cursor: String, $increment: Int, $org_name: String!, $repo_name: String!){
  rateLimit {
    limit
    cost
    remaining
    resetAt
  }
  repository(owner:$org_name, name:$repo_name) {
    name
    url
    id
    databaseId
    issues(first: $increment, after: $repo_cursor, orderBy: {field: UPDATED_AT, direction: DESC}) {
      totalCount
      edges {
       cursor
        node {
          id
          closedAt
          title
        }
      }
    }
  }
}
```

Query parameters:
* __$repo_cursor__: Cursor used for pagination
* __$increment__: number of nodes to be fetched, please note that Github limits this number to 100.
* __$org_name__: Github Organization name (`elastic` for example)
* __$repo_name__: Github Repository name within the above organization (`kibana` for example).

This query sorts the result by last updated date starting from the most recent, meaning the initial load is expensive, but the following one could just fetch the updated issues.

Note: GitHub's API has a rate limit based on cost of each call. This method of displaying data requires downloading everything from GitHub first.

## Libraries

The following libraries are being used
* React
* Redux & rematch: Rematch provides an abstraction layer over Redux for store and reducers configuration. Interaction between views and the store remain unchanged.
* Storybook: Just setup in case the app was to grow further than just the velocity chart. Stories are connected to a  store with mock data, allowing offline development and avoiding frequent calls to the Elasticsearch.
* Material-ui: React UI library following Google's material UI principles
* Highcharts: To power the velocity chart
* Elasticsearch: Javascript API to query a remote Elasticsearch server

## License

AGPLv3