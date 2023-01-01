let url=new URL('https://127.0.0.1/save');
let params = new URLSearchParams(url.search);

params.append('userId','178372732');
params.append('tweet','https://www.twitter.com/chinma_yyy')
console.log(process.env.BASE_URL+params.toString());