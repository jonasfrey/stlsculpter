let o_resp = await fetch("https://makerworld.com/_next/data/zNdz8uCYiEX726DNcU4b_/en/my/models/publish.json?type=original", {
  "headers": {
    "sec-ch-ua": "\"Google Chrome\";v=\"135\", \"Not-A.Brand\";v=\"8\", \"Chromium\";v=\"135\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Linux\"",
    "x-nextjs-data": "1"
  },
  "referrer": "https://makerworld.com/en/my/models/drafts/3779626/edit",
  "referrerPolicy": "strict-origin-when-cross-origin",
  "body": null,
  "method": "GET",
  "mode": "cors",
  "credentials": "omit"
});
console.log(o_resp)