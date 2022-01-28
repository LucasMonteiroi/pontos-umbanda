const docs = require("@googleapis/docs");
const { google } = require("googleapis");

createFile = async function (fileName, client) {
  const createResponse = await client.documents.create({
    requestBody: {
      title: fileName,
    },
  });

  return createResponse.data.documentId;
};

updateFile = async function (fileId, client, data) {
  const updateResponse = await client.documents.batchUpdate({
    documentId: fileId,
    requestBody: {
      requests: [
        {
          insertText: {
            // The first text inserted into the document must create a paragraph,
            // which can't be done with the `location` property.  Use the
            // `endOfSegmentLocation` instead, which assumes the Body if
            // unspecified.
            endOfSegmentLocation: {},
            text: data,
          },
        },
      ],
    },
  });

  return updateResponse.data;
};

updateFileStyleTextToBold = async function (fileId, client) {
  const updateResponse = await client.documents.batchUpdate({
    documentId: fileId,
    requestBody: {
      requests: [
        {
          updateTextStyle: {
            fields: "*",
            textStyle: {
              bold: true,
            },
            range: {
              startIndex: 0,
              endIndex: 5,
            },
          },
        },
      ],
    },
  });

  return updateResponse.data;
};

async function grantPermission(fileId, auth) {
  var permissions = [
    {
      type: "user",
      role: "writer",
      emailAddress: "lucas.inacio@jamesdelivery.com.br",
    },
  ];
  const drive = google.drive({ version: "v3", auth });
  var permissionCreated = await drive.permissions
    .create({
      resource: permissions[0],
      fileId: fileId,
      fields: "id",
      sendNotificationEmail: false,
    })
    .then((data) => {
      console.log(data);
    })
    .catch((err) => {
      console.log(err);
    });
}

async function execute(fileName, data) {
  //Scopes and auth
  const auth = new docs.auth.GoogleAuth({
    keyFilename: "credentials.json",
    // Scopes can be specified either as an array or as a single, space-delimited string.
    scopes: [
      "https://www.googleapis.com/auth/documents",
      "https://www.googleapis.com/auth/drive.metadata.readonly",
      "https://www.googleapis.com/auth/drive.readonly",
      "https://www.googleapis.com/auth/drive",
      "https://www.googleapis.com/auth/drive.file",
    ],
  });
  const authClient = await auth.getClient();

  const client = await docs.docs({
    version: "v1",
    auth: authClient,
  });

  const fileId = await createFile(fileName, client);
  await grantPermission(fileId, auth);
  // await updateFileStyleTextToBold(fileId, client);
  const responseUpdate = await updateFile(fileId, client, data);
  console.log(responseUpdate);
}

module.exports = {
  execute,
};
