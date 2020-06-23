console.log('PRE', process.env.WITHINGS_TOKEN)
process.env.WITHINGS_TOKEN = 'thisisatest!!!';
console.log('POST', process.env.WITHINGS_TOKEN)