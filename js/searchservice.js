
export const RADIUS = 3000;

export function doSearch(URL){
  console.log('doing query', URL);
  return fetch(URL).then(data => data.json());
}
