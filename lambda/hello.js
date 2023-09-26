exports.handler = async function (event) {
  console.log("request ->", JSON.stringify(event, null, 2));

  return {
    statusCode: 200,
    headers: { "Content-type": "text/plain" },
    body: `Good night!, CDK! You've hit ${event.path}\n`,
  };
};
