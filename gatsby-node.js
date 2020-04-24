const firebase = require("firebase-admin")

exports.sourceNodes = (
  { actions, createNodeId, createContentDigest },
  { credential, databaseURL, documents, limit = 4 },
  done
) => {
  const { createNode } = actions

  firebase.initializeApp({
    credential: firebase.credential.cert(credential),
    databaseURL: databaseURL
  })

  const db = firebase.firestore()
  db.settings({timestampsInSnapshots: true})

  documents.forEach(

    ({ graphQl, collection, limit }) => {
      
      db.collection(collection).limit(limit).get().then(snapshot => {
          
          if (snapshot.empty) {
              console.log('No matching documents.')
              return false
          }

          let data = snapshot.docs.map(function (documentSnapshot) {

            let key = Math.random().toString(36).slice(2);
          
            const node = documentSnapshot.data()

            if(node.hasOwnProperty('store___NODE')){
              console.log('ha collegamenti esterni')
              delete node['store___NODE']
            }

            createNode(
              Object.assign(node, {
                id: createNodeId(key),
                parent: null,
                children: [],
                internal: {
                  type: graphQl,
                  contentDigest: createContentDigest(node)
                }
              })
            )
          })

          done()
      })
    },
    error => {
      throw new Error(error)
    }
  )
}


const ERROR_MESSAGE = `For "gatsby-source-firebase", you must pass the file relative path to json "certifcation" Firebase.

Learn more at https://github.com/alexluong/gatsby-plugin-firebase.
`

exports.onPreBootstrap = ({ reporter }, options) => {
  if (!options.credential) {
    reporter.panic(ERROR_MESSAGE)
  }
}