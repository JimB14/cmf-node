
var configObj = {};


configObj.dbConfigMlab = {
   username: 'jburns14',
   password: 'Pa$$w0rd1!',
   host: 'ds155934.mlab.com',
   port: '55934',
   dbname: 'cmf'
};

configObj.dbConfig = {
   username: 'jburns14',
   password: 'Hopehope1!',
   host: 'localhost',
   dbname: 'cmf'
};


configObj.uploadConfig = {
   localPath: 'C:/Users/Jim/nodeProjects/cmf-node/public/images/uploaded_images/',
   livePath: '/images/uploaded_images/'
};


configObj.mail = {
   testWmpAccount: 'test@webmediapartners.com',
   testWmpPassword: 'Hopehope1!',
   gmailAccount: 'jim.burns14@gmail.com',
   gmailPassword: 'Hopehope2@',
   jimWmpAccount: 'jim.burns@webmediapartners.com'
};



module.exports = configObj;
