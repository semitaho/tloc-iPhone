

export function removeHtml(text){
  var regex = /(&nbsp;|<([^>]+)>)/ig,
    body = text, 
    result = body.replace(regex, "");
  return result;
}