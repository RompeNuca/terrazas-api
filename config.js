
  const ok = {
    domain: 'https://api-demo01.herokuapp.com/',
    port: process.env.PORT || 3000,
    db: process.env.MONGODB || 'mongodb://demoUser:pasword3@ds227352.mlab.com:27352/db-demo',
    SECRET_TOKEN: 'estaEsMiClaveDeTokens',
    path: '',
    cloudDomain:'https://res.cloudinary.com',
    cloudConfig: {
      cloud_name: 'hjzfc79v8', 
      api_key: '418297315424413', 
      api_secret: '2BYAZP3ZJ6wCBXBHnIndPrmzdYs'
    }
  }

  // const ok = {
  //   domain: 'http://localhost:',
  //   port: process.env.PORT || 3000,
  //   db: process.env.MONGODB || 'mongodb://localhost:27017/apiRestDb',
  //   SECRET_TOKEN: 'estaEsMiClaveDeTokens',
  //   path: '',
  //   cloudDomain:'https://res.cloudinary.com',
  //   cloudConfig: {
  //     cloud_name: 'hjzfc79v8', 
  //     api_key: '418297315424413', 
  //     api_secret: '2BYAZP3ZJ6wCBXBHnIndPrmzdYs'
  //   }
  // }

  let path = ok.domain + ok.port + '/'
  ok.path = path

module.exports =  ok



