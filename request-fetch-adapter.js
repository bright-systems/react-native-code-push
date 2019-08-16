const packageJson = require("./package.json");
const staticConfig = require('../../config/application').default
const deviceLog = require('react-native-device-log').default

module.exports = {
  async request(verb, url, requestBody, callback) {
    if (typeof requestBody === "function") {
      callback = requestBody;
      requestBody = null;
    }

    const headers = {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "X-CodePush-Plugin-Name": packageJson.name,
      "X-CodePush-Plugin-Version": packageJson.version,
      "X-CodePush-SDK-Version": packageJson.dependencies["code-push"]
    };

    if (requestBody && typeof requestBody === "object") {
      requestBody = JSON.stringify(requestBody);
    }

    let newUrl = url
    if (staticConfig.codepush.metadataUrl){
      deviceLog.debug('rewriting codepush metadataUrl')
      const urlVars = url.substring(url.indexOf('?'), url.length)
      newUrl = staticConfig.codepush.metadataUrl + urlVars
    }

    //deviceLog.debug('codepush metadata url', newUrl)

    try {
      const response = await fetch(url, {
        method: getHttpMethodName(verb),
        headers: headers,
        body: requestBody
      });

      const statusCode = response.status;
      const body = await response.text();
      callback(null, { statusCode, body });
    } catch (err) {
      callback(err);
    }
  }
};

function getHttpMethodName(verb) {
  // Note: This should stay in sync with the enum definition in
  // https://github.com/Microsoft/code-push/blob/master/sdk/script/acquisition-sdk.ts#L6
  return [
    "GET",
    "HEAD",
    "POST",
    "PUT",
    "DELETE",
    "TRACE",
    "OPTIONS",
    "CONNECT",
    "PATCH"
  ][verb];
}