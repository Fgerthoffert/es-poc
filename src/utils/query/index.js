import es from 'elasticsearch';

const client = new es.Client({
    host: 'https://3e11c448bafd4bdd8b9031d5c08057c8.us-east-1.aws.found.io:9243',
    httpAuth: 'open_user:anonymous'
});

/*
*
* esSearch() Executes search query agains elastic search
*
* Arguments:
* - query: The ES query json
*/
export const esSearch = (query) => {
  return client.search(query);
};
