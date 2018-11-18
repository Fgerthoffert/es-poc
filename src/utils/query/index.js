import es from 'elasticsearch';

const client = new es.Client({
    host: 'https://3e11c448bafd4bdd8b9031d5c08057c8.us-east-1.aws.found.io:9243',
    httpAuth: 'open_user:anonymous'
});

/*
*
* executeQuery() Executes a query towards an ElasticSearch instance
*
* Arguments:
* - query: The ES query string
* - index: Elastic search index to query
* - fields to be fetched
*/
export const executeQuery = async (query, index, fields) => {
    console.log('Will Execute query: ' + JSON.stringify(query));
    const response = await client.search({
        index: index,
        q: query,
        _source: fields,
        size: 40000,
        filter_path: 'hits.hits.*'
    });
    console.log(response);
    return response.hits.hits;
};

export const esSearch = (query) => {
  return client.search(query);
/*
  return new Promise((resolve, reject) => {
      return client.search(query);
    });
*/
};
